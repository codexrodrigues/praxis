import { Token, TokenType, OPERATOR_KEYWORDS, COMPARISON_OPERATORS } from './token';

export class DslTokenizer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      const token = this.nextToken();
      if (token.type !== TokenType.WHITESPACE) {
        tokens.push(token);
      }
    }
    
    tokens.push({
      type: TokenType.EOF,
      value: '',
      position: this.position,
      line: this.line,
      column: this.column
    });
    
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();
    
    if (this.position >= this.input.length) {
      return this.createToken(TokenType.EOF, '');
    }

    const char = this.input[this.position];
    
    // Field references ${...}
    if (char === '$' && this.peek() === '{') {
      return this.readFieldReference();
    }
    
    // String literals
    if (char === '"' || char === "'") {
      return this.readString(char);
    }
    
    // Numbers
    if (this.isDigit(char) || (char === '-' && this.isDigit(this.peek()))) {
      return this.readNumber();
    }
    
    // Multi-character operators
    const twoChar = this.input.substr(this.position, 2);
    if (COMPARISON_OPERATORS[twoChar]) {
      const token = this.createToken(COMPARISON_OPERATORS[twoChar], twoChar);
      this.advance(2);
      return token;
    }
    
    // Single character operators and punctuation
    switch (char) {
      case '(':
        return this.createTokenAndAdvance(TokenType.LEFT_PAREN, char);
      case ')':
        return this.createTokenAndAdvance(TokenType.RIGHT_PAREN, char);
      case '[':
        return this.createTokenAndAdvance(TokenType.LEFT_BRACKET, char);
      case ']':
        return this.createTokenAndAdvance(TokenType.RIGHT_BRACKET, char);
      case ',':
        return this.createTokenAndAdvance(TokenType.COMMA, char);
      case '.':
        return this.createTokenAndAdvance(TokenType.DOT, char);
      case '!':
        if (this.peek() === '=') {
          const token = this.createToken(TokenType.NOT_EQUALS, '!=');
          this.advance(2);
          return token;
        }
        return this.createTokenAndAdvance(TokenType.NOT, char);
      case '<':
        if (this.peek() === '=') {
          const token = this.createToken(TokenType.LESS_THAN_OR_EQUAL, '<=');
          this.advance(2);
          return token;
        }
        return this.createTokenAndAdvance(TokenType.LESS_THAN, char);
      case '>':
        if (this.peek() === '=') {
          const token = this.createToken(TokenType.GREATER_THAN_OR_EQUAL, '>=');
          this.advance(2);
          return token;
        }
        return this.createTokenAndAdvance(TokenType.GREATER_THAN, char);
      case '=':
        if (this.peek() === '=') {
          const token = this.createToken(TokenType.EQUALS, '==');
          this.advance(2);
          return token;
        }
        break;
      case '&':
        if (this.peek() === '&') {
          const token = this.createToken(TokenType.AND, '&&');
          this.advance(2);
          return token;
        }
        break;
      case '|':
        if (this.peek() === '|') {
          const token = this.createToken(TokenType.OR, '||');
          this.advance(2);
          return token;
        }
        break;
    }
    
    // Identifiers and keywords
    if (this.isAlpha(char) || char === '_') {
      return this.readIdentifier();
    }
    
    throw new Error(`Unexpected character '${char}' at position ${this.position}`);
  }

  private readFieldReference(): Token {
    const start = this.position;
    this.advance(2); // Skip ${
    
    let value = '';
    while (this.position < this.input.length && this.input[this.position] !== '}') {
      value += this.input[this.position];
      this.advance();
    }
    
    if (this.position >= this.input.length) {
      throw new Error('Unterminated field reference');
    }
    
    this.advance(); // Skip }
    
    return this.createToken(TokenType.FIELD_REFERENCE, value, start);
  }

  private readString(quote: string): Token {
    const start = this.position;
    this.advance(); // Skip opening quote
    
    let value = '';
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\\') {
        this.advance();
        if (this.position < this.input.length) {
          const escaped = this.input[this.position];
          switch (escaped) {
            case 'n': value += '\n'; break;
            case 't': value += '\t'; break;
            case 'r': value += '\r'; break;
            case '\\': value += '\\'; break;
            case '"': value += '"'; break;
            case "'": value += "'"; break;
            default: value += escaped; break;
          }
          this.advance();
        }
      } else {
        value += this.input[this.position];
        this.advance();
      }
    }
    
    if (this.position >= this.input.length) {
      throw new Error('Unterminated string literal');
    }
    
    this.advance(); // Skip closing quote
    
    return this.createToken(TokenType.STRING, value, start);
  }

  private readNumber(): Token {
    const start = this.position;
    let value = '';
    
    if (this.input[this.position] === '-') {
      value += this.input[this.position];
      this.advance();
    }
    
    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.advance();
    }
    
    if (this.position < this.input.length && this.input[this.position] === '.') {
      value += this.input[this.position];
      this.advance();
      
      while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
        value += this.input[this.position];
        this.advance();
      }
    }
    
    return this.createToken(TokenType.NUMBER, value, start);
  }

  private readIdentifier(): Token {
    const start = this.position;
    let value = '';
    
    while (this.position < this.input.length && 
           (this.isAlphaNumeric(this.input[this.position]) || this.input[this.position] === '_')) {
      value += this.input[this.position];
      this.advance();
    }
    
    const tokenType = OPERATOR_KEYWORDS[value] || TokenType.IDENTIFIER;
    return this.createToken(tokenType, value, start);
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && this.isWhitespace(this.input[this.position])) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private createToken(type: TokenType, value: string, startPos?: number): Token {
    return {
      type,
      value,
      position: startPos ?? this.position,
      line: this.line,
      column: this.column - value.length
    };
  }

  private createTokenAndAdvance(type: TokenType, value: string): Token {
    const token = this.createToken(type, value);
    this.advance();
    return token;
  }

  private advance(count: number = 1): void {
    for (let i = 0; i < count && this.position < this.input.length; i++) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private peek(offset: number = 1): string {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : '';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }
}