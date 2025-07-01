import { Token, TokenType } from './token';
import { DslTokenizer } from './tokenizer';
import { Specification } from '../specification/specification';
import { FieldSpecification } from '../specification/field-specification';
import { AndSpecification } from '../specification/and-specification';
import { OrSpecification } from '../specification/or-specification';
import { NotSpecification } from '../specification/not-specification';
import { XorSpecification } from '../specification/xor-specification';
import { ImpliesSpecification } from '../specification/implies-specification';
import { FunctionSpecification } from '../specification/function-specification';
import { AtLeastSpecification } from '../specification/at-least-specification';
import { ExactlySpecification } from '../specification/exactly-specification';
import { ComparisonOperator } from '../specification/comparison-operator';
import { FunctionRegistry } from '../registry/function-registry';

export class DslParser<T extends object = any> {
  private tokens: Token[] = [];
  private current: number = 0;

  constructor(private functionRegistry?: FunctionRegistry<T>) {}

  parse(input: string): Specification<T> {
    const tokenizer = new DslTokenizer(input);
    this.tokens = tokenizer.tokenize();
    this.current = 0;
    
    const spec = this.parseExpression();
    
    if (!this.isAtEnd()) {
      throw new Error(`Unexpected token: ${this.peek().value}`);
    }
    
    return spec;
  }

  private parseExpression(): Specification<T> {
    return this.parseImplies();
  }

  private parseImplies(): Specification<T> {
    let expr = this.parseXor();
    
    while (this.match(TokenType.IMPLIES)) {
      const right = this.parseXor();
      expr = new ImpliesSpecification<T>(expr, right);
    }
    
    return expr;
  }

  private parseXor(): Specification<T> {
    let expr = this.parseOr();
    
    while (this.match(TokenType.XOR)) {
      const right = this.parseOr();
      if (expr instanceof XorSpecification) {
        expr = new XorSpecification<T>([...expr.getSpecifications(), right]);
      } else {
        expr = new XorSpecification<T>([expr, right]);
      }
    }
    
    return expr;
  }

  private parseOr(): Specification<T> {
    let expr = this.parseAnd();
    
    while (this.match(TokenType.OR)) {
      const right = this.parseAnd();
      if (expr instanceof OrSpecification) {
        expr = new OrSpecification<T>([...expr.getSpecifications(), right]);
      } else {
        expr = new OrSpecification<T>([expr, right]);
      }
    }
    
    return expr;
  }

  private parseAnd(): Specification<T> {
    let expr = this.parseUnary();
    
    while (this.match(TokenType.AND)) {
      const right = this.parseUnary();
      if (expr instanceof AndSpecification) {
        expr = new AndSpecification<T>([...expr.getSpecifications(), right]);
      } else {
        expr = new AndSpecification<T>([expr, right]);
      }
    }
    
    return expr;
  }

  private parseUnary(): Specification<T> {
    if (this.match(TokenType.NOT)) {
      const expr = this.parseUnary();
      return new NotSpecification<T>(expr);
    }
    
    return this.parseComparison();
  }

  private parseComparison(): Specification<T> {
    let expr = this.parsePrimary();
    
    if (this.matchComparison()) {
      const operator = this.previous().type;
      const right = this.parsePrimary();
      
      // Handle field to field comparison
      if (expr instanceof FieldSpecification && right instanceof FieldSpecification) {
        // This would need FieldToFieldSpecification logic
        throw new Error('Field to field comparison not yet implemented in parser');
      }
      
      // Handle field to value comparison
      if (expr instanceof FieldSpecification) {
        const field = expr.getField() as keyof T;
        const value = this.extractValue(right);
        const compOp = this.tokenTypeToComparisonOperator(operator);
        return new FieldSpecification<T>(field, compOp, value);
      }
      
      throw new Error('Invalid comparison expression');
    }
    
    return expr;
  }

  private parsePrimary(): Specification<T> {
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }
    
    if (this.match(TokenType.FIELD_REFERENCE)) {
      const fieldName = this.previous().value;
      return new FieldSpecification<T>(fieldName as keyof T, ComparisonOperator.EQUALS, true);
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      const identifier = this.previous().value;
      
      // Check if this is a function call
      if (this.match(TokenType.LEFT_PAREN)) {
        return this.parseFunctionCall(identifier);
      }
      
      // Otherwise treat as field reference
      return new FieldSpecification<T>(identifier as keyof T, ComparisonOperator.EQUALS, true);
    }
    
    throw new Error(`Unexpected token: ${this.peek().value}`);
  }

  private parseFunctionCall(functionName: string): Specification<T> {
    const args: any[] = [];
    
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.parseArgument());
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after function arguments");
    
    // Handle special built-in functions
    switch (functionName) {
      case 'atLeast':
        if (args.length !== 2) {
          throw new Error('atLeast requires exactly 2 arguments');
        }
        const min = args[0];
        const specs = args[1];
        if (!Array.isArray(specs)) {
          throw new Error('atLeast second argument must be an array of specifications');
        }
        return new AtLeastSpecification<T>(min, specs);
      
      case 'exactly':
        if (args.length !== 2) {
          throw new Error('exactly requires exactly 2 arguments');
        }
        const exact = args[0];
        const exactSpecs = args[1];
        if (!Array.isArray(exactSpecs)) {
          throw new Error('exactly second argument must be an array of specifications');
        }
        return new ExactlySpecification<T>(exact, exactSpecs);
      
      case 'contains':
      case 'startsWith':
      case 'endsWith':
        if (args.length !== 2) {
          throw new Error(`${functionName} requires exactly 2 arguments`);
        }
        const field = args[0];
        const value = args[1];
        const op = this.functionNameToOperator(functionName);
        return new FieldSpecification<T>(field, op, value);
      
      default:
        return new FunctionSpecification<T>(functionName, args, this.functionRegistry);
    }
  }

  private parseArgument(): any {
    if (this.match(TokenType.STRING)) {
      return this.previous().value;
    }
    
    if (this.match(TokenType.NUMBER)) {
      const value = this.previous().value;
      return value.includes('.') ? parseFloat(value) : parseInt(value, 10);
    }
    
    if (this.match(TokenType.BOOLEAN)) {
      return this.previous().value === 'true';
    }
    
    if (this.match(TokenType.NULL)) {
      return null;
    }
    
    if (this.match(TokenType.FIELD_REFERENCE)) {
      return this.previous().value;
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      return this.previous().value;
    }
    
    if (this.match(TokenType.LEFT_BRACKET)) {
      const elements: any[] = [];
      
      if (!this.check(TokenType.RIGHT_BRACKET)) {
        do {
          elements.push(this.parseArgument());
        } while (this.match(TokenType.COMMA));
      }
      
      this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after array elements");
      return elements;
    }
    
    throw new Error(`Unexpected token in argument: ${this.peek().value}`);
  }

  private matchComparison(): boolean {
    return this.match(
      TokenType.EQUALS,
      TokenType.NOT_EQUALS,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_OR_EQUAL,
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_OR_EQUAL,
      TokenType.IN
    );
  }

  private tokenTypeToComparisonOperator(tokenType: TokenType): ComparisonOperator {
    switch (tokenType) {
      case TokenType.EQUALS:
        return ComparisonOperator.EQUALS;
      case TokenType.NOT_EQUALS:
        return ComparisonOperator.NOT_EQUALS;
      case TokenType.LESS_THAN:
        return ComparisonOperator.LESS_THAN;
      case TokenType.LESS_THAN_OR_EQUAL:
        return ComparisonOperator.LESS_THAN_OR_EQUAL;
      case TokenType.GREATER_THAN:
        return ComparisonOperator.GREATER_THAN;
      case TokenType.GREATER_THAN_OR_EQUAL:
        return ComparisonOperator.GREATER_THAN_OR_EQUAL;
      case TokenType.IN:
        return ComparisonOperator.IN;
      default:
        throw new Error(`Unknown comparison operator: ${tokenType}`);
    }
  }

  private functionNameToOperator(functionName: string): ComparisonOperator {
    switch (functionName) {
      case 'contains':
        return ComparisonOperator.CONTAINS;
      case 'startsWith':
        return ComparisonOperator.STARTS_WITH;
      case 'endsWith':
        return ComparisonOperator.ENDS_WITH;
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  private extractValue(spec: any): any {
    // This is a simplified extraction - in a real implementation
    // we'd need to handle more complex cases
    if (spec instanceof FieldSpecification) {
      return spec.getValue();
    }
    return spec;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message}. Got: ${this.peek().value}`);
  }
}