# Mini-DSL Language Reference

A comprehensive guide to the Praxis Visual Builder mini-DSL expression language.

## Table of Contents

1. [Language Overview](#language-overview)
2. [Basic Syntax](#basic-syntax)
3. [Data Types](#data-types)
4. [Operators](#operators)
5. [Functions](#functions)
6. [Context Variables](#context-variables)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

## Language Overview

The Praxis Visual Builder mini-DSL is a domain-specific language designed for creating expressive validation rules and business logic conditions. It provides a familiar syntax similar to programming languages while being optimized for rule-based scenarios.

### Key Features

- **Type-safe expressions** with automatic type inference
- **Context variable support** with scoped resolution
- **Rich function library** for common operations
- **Real-time validation** with detailed error messages
- **Performance optimization** with complexity analysis

### Design Principles

- **Readability**: Expressions should be easily understood by both technical and non-technical users
- **Safety**: Strong typing and validation prevent runtime errors
- **Extensibility**: Support for custom functions and context providers
- **Performance**: Efficient parsing and evaluation with complexity warnings

## Basic Syntax

### Comments

```dsl
# This is a line comment
age > 18  # Comments can be at the end of lines
```

### Literals

**String Literals:**
```dsl
name == "John Doe"
message == 'Hello, World!'
description == "User's \"preferred\" option"  # Escaped quotes
```

**Number Literals:**
```dsl
age == 25
price == 99.99
percentage == 0.15
scientific == 1.5e10
```

**Boolean Literals:**
```dsl
active == true
deleted == false
```

**Null Literal:**
```dsl
optionalField == null
requiredField != null
```

**Array Literals:**
```dsl
category in ["tech", "science", "math"]
scores == [85, 92, 78, 95]
flags == [true, false, true]
```

### Field References

Fields are referenced by their name and can include nested properties using dot notation:

```dsl
age > 18
user.profile.name == "John"
address.coordinates.latitude > 40.0
```

## Data Types

### Primitive Types

**String:**
- Text values enclosed in quotes
- Support for escape sequences: `\"`, `\'`, `\\`, `\n`, `\t`
- Unicode support

**Number:**
- Integer: `42`, `-17`, `0`
- Decimal: `3.14`, `-0.5`, `99.99`
- Scientific notation: `1e6`, `2.5e-3`

**Boolean:**
- `true` or `false`
- Case-sensitive

**Null:**
- Represents absence of value
- Used for optional field checks

### Collection Types

**Array:**
- Ordered collection of values
- Mixed types allowed: `[1, "text", true]`
- Nested arrays supported: `[[1, 2], [3, 4]]`

**Object:**
- Key-value pairs accessible via dot notation
- Example: `user.profile.settings.theme`

### Type Coercion

The DSL performs automatic type coercion in certain contexts:

```dsl
# String to number
"123" > 100  # true

# Number to string
42 == "42"   # true

# Boolean to string
true == "true"   # true
```

## Operators

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal | `age == 25` |
| `!=` | Not equal | `status != "deleted"` |
| `>` | Greater than | `score > 80` |
| `>=` | Greater than or equal | `age >= 18` |
| `<` | Less than | `price < 100` |
| `<=` | Less than or equal | `weight <= 50` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `age > 18 && active == true` |
| `\|\|` | Logical OR | `urgent == true \|\| priority == "high"` |
| `!` | Logical NOT | `!(deleted == true)` |
| `^` | Logical XOR | `primary ^ backup` |
| `=>` | Implies | `premium => features.length > 5` |

### Membership Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `in` | Member of collection | `role in ["admin", "moderator"]` |
| `not in` | Not member of collection | `status not in ["deleted", "banned"]` |

### String Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `~` | Contains (shorthand) | `email ~ "@company.com"` |
| `!~` | Does not contain | `filename !~ ".tmp"` |

### Null Check Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `is null` | Check if null | `optionalField is null` |
| `is not null` | Check if not null | `requiredField is not null` |

### Precedence Rules

Operators are evaluated in the following order (highest to lowest precedence):

1. `()` - Parentheses
2. `!` - Logical NOT
3. `*`, `/`, `%` - Multiplication, Division, Modulo
4. `+`, `-` - Addition, Subtraction
5. `<`, `<=`, `>`, `>=` - Relational operators
6. `==`, `!=`, `~`, `!~` - Equality and pattern operators
7. `in`, `not in`, `is null`, `is not null` - Membership and null checks
8. `&&` - Logical AND
9. `||` - Logical OR
10. `^` - Logical XOR
11. `=>` - Logical implication

## Functions

### String Functions

**contains(string, substring)**
```dsl
contains(description, "important")
contains(tags, "urgent")
```

**startsWith(string, prefix)**
```dsl
startsWith(email, "admin")
startsWith(code, "PRE_")
```

**endsWith(string, suffix)**
```dsl
endsWith(filename, ".pdf")
endsWith(url, "/api")
```

**length(string)**
```dsl
length(password) >= 8
length(description) > 0
```

**upper(string)**
```dsl
upper(category) == "TECHNOLOGY"
upper(status) in ["ACTIVE", "PENDING"]
```

**lower(string)**
```dsl
lower(email) == "user@domain.com"
contains(lower(name), "john")
```

**trim(string)**
```dsl
length(trim(input)) > 0
trim(description) != ""
```

**substring(string, start, length?)**
```dsl
substring(code, 0, 3) == "ABC"
substring(year, 2, 2) == "23"
```

**replace(string, search, replacement)**
```dsl
replace(phone, "-", "") == "1234567890"
length(replace(text, " ", "")) > 10
```

**split(string, delimiter)**
```dsl
length(split(tags, ",")) > 3
split(fullName, " ")[0] == "John"
```

### Numeric Functions

**abs(number)**
```dsl
abs(balance) > 1000
abs(difference) < 0.01
```

**round(number, digits?)**
```dsl
round(percentage) == 85
round(price, 2) == 99.99
```

**floor(number)**
```dsl
floor(score / 10) == 8
floor(age / 5) * 5 >= 20
```

**ceil(number)**
```dsl
ceil(rating) >= 4
ceil(duration / 60) <= 2
```

**min(number, ...numbers)**
```dsl
min(score1, score2, score3) >= 70
min(values) > threshold
```

**max(number, ...numbers)**
```dsl
max(attempts) <= 5
max(ratings) >= 4.0
```

**sum(array)**
```dsl
sum(scores) > 250
sum(quantities) <= inventory.total
```

**avg(array)**
```dsl
avg(ratings) >= 4.0
avg(scores) > classAverage
```

### Date/Time Functions

**now()**
```dsl
createdAt <= now()
expirationDate > now()
```

**today()**
```dsl
eventDate >= today()
deadline == today()
```

**dateAdd(date, amount, unit)**
```dsl
dateAdd(startDate, 30, "days") <= endDate
dateAdd(createdAt, 1, "year") > now()
```

**dateDiff(date1, date2, unit)**
```dsl
dateDiff(endDate, startDate, "days") <= 365
dateDiff(now(), lastLogin, "hours") < 24
```

**dateFormat(date, format)**
```dsl
dateFormat(createdAt, "YYYY-MM-DD") == "2023-12-01"
dateFormat(now(), "HH:mm") >= "09:00"
```

### Array Functions

**forEach(array, condition)**
```dsl
forEach(items, item.quantity > 0)
forEach(users, user.active == true)
```

**some(array, condition)**
```dsl
some(permissions, permission == "admin")
some(scores, score >= 90)
```

**every(array, condition)**
```dsl
every(items, item.price > 0)
every(users, user.emailVerified == true)
```

**filter(array, condition)**
```dsl
length(filter(items, item.active)) > 0
filter(scores, score >= 80).length >= 3
```

**map(array, expression)**
```dsl
max(map(items, item.price)) <= budget
sum(map(quantities, qty * price)) > 1000
```

**uniqueBy(array, field)**
```dsl
length(uniqueBy(users, "email")) == length(users)
uniqueBy(products, "sku").length > 0
```

### Collection Functions

**atLeast(count, conditions)**
```dsl
atLeast(2, [condition1, condition2, condition3])
atLeast(1, [isAdmin, isModerator, isOwner])
```

**exactly(count, conditions)**
```dsl
exactly(1, [isPrimary, isSecondary, isBackup])
exactly(0, [hasErrors, hasWarnings])
```

**minLength(array, minimum)**
```dsl
minLength(items, 1)
minLength(tags, 3)
```

**maxLength(array, maximum)**
```dsl
maxLength(attachments, 5)
maxLength(comments, 100)
```

### Validation Functions

**required(field)**
```dsl
required(email)
required(name) && length(name) > 0
```

**requiredIf(field, condition)**
```dsl
requiredIf(phone, country == "US")
requiredIf(ssn, citizen == true)
```

**visibleIf(field, condition)**
```dsl
visibleIf(advancedOptions, userLevel == "expert")
visibleIf(billingAddress, sameAsShipping == false)
```

**disabledIf(field, condition)**
```dsl
disabledIf(submitButton, hasErrors == true)
disabledIf(deleteAction, hasChildren == true)
```

**readonlyIf(field, condition)**
```dsl
readonlyIf(createdAt, status == "published")
readonlyIf(id, isExisting == true)
```

### Optional Handling Functions

**ifDefined(field, condition)**
```dsl
ifDefined(optionalField, optionalField > 0)
ifDefined(settings, settings.theme == "dark")
```

**ifNotNull(field, condition)**
```dsl
ifNotNull(description, length(description) > 10)
ifNotNull(avatar, endsWith(avatar, ".jpg"))
```

**ifExists(field, condition)**
```dsl
ifExists(metadata.tags, length(metadata.tags) > 0)
ifExists(config.timeout, config.timeout > 1000)
```

**withDefault(field, defaultValue, condition)**
```dsl
withDefault(priority, "medium", priority in ["low", "medium", "high"])
withDefault(quantity, 1, quantity > 0)
```

### Custom Functions

You can register custom functions for domain-specific operations:

```typescript
// Register custom email validation
functionRegistry.register('isEmail', {
  name: 'isEmail',
  arity: 1,
  implementation: (value: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  description: 'Validates email format'
});

// Use in DSL
email != null && isEmail(email)
```

## Context Variables

Context variables provide dynamic values that can be resolved at runtime. They use the syntax `${scope.variable}`.

### Variable Scopes

**User Scope (`user.*`)**
User-specific values like preferences, profile data, and permissions:
```dsl
age > ${user.minAge}
department == "${user.department}"
level >= ${user.requiredLevel}
role in ${user.allowedRoles}
```

**Session Scope (`session.*`)**
Session-specific values like current state and temporary data:
```dsl
createdAt >= "${session.startTime}"
locale == "${session.language}"
timezone == "${session.timezone}"
sessionId == "${session.id}"
```

**Environment Scope (`env.*`)**
Environment configuration like feature flags and debug settings:
```dsl
debug == ${env.debugMode}
features.newUI == ${env.features.enabled}
apiVersion >= "${env.minApiVersion}"
```

**Global Scope (`global.*`)**
Application-wide constants and policies:
```dsl
fileSize <= ${global.maxFileSize}
format in ${global.supportedFormats}
price >= ${global.minimumPrice}
```

### Variable Types and Resolution

**String Variables:**
```dsl
# String interpolation with quotes
message == "Hello, ${user.name}!"
greeting == "${session.timeOfDay} ${user.title}"

# Direct string comparison
status == "${config.defaultStatus}"
```

**Number Variables:**
```dsl
# Numeric comparisons
quantity <= ${inventory.available}
price >= ${pricing.minimumPrice}
discount <= ${user.maxDiscount}
```

**Boolean Variables:**
```dsl
# Boolean conditions
enabled == ${feature.isEnabled}
visible == ${user.canView}
required == ${field.isRequired}
```

**Array Variables:**
```dsl
# Array membership
category in ${user.allowedCategories}
permission in ${role.permissions}
tag in ${content.allowedTags}
```

**Object Variables:**
```dsl
# Object property access
theme == "${user.preferences.theme}"
currency == "${region.settings.currency}"
format == "${locale.dateFormat}"
```

### Dynamic Resolution

Context variables are resolved dynamically, allowing for:

**Runtime Configuration:**
```dsl
# Feature flags
newFeature == true && ${env.features.beta} == true

# A/B testing
variant == "${session.experiment.variant}"

# Personalization
recommendations >= ${user.preferences.minRating}
```

**Conditional Logic:**
```dsl
# User role-based rules
(role == "admin") || (role == "moderator" && ${policy.moderatorCanEdit})

# Time-based rules
hour >= ${business.hours.open} && hour <= ${business.hours.close}

# Location-based rules
country in ${service.availableCountries}
```

## Advanced Features

### Nested Expressions

Complex logic can be built using nested parentheses:

```dsl
((age >= 18 && age <= 65) || experience > 10) && 
(
  (department == "Engineering" && level >= 3) || 
  (department == "Product" && level >= 2) ||
  (department == "Design" && portfolio.length > 5)
) && 
!(archived == true || deleted == true || suspended == true)
```

### Function Composition

Functions can be chained and composed:

```dsl
# String manipulation chain
contains(upper(trim(department)), "ENG") && 
length(replace(phone, "-", "")) == 10

# Array processing chain
max(map(filter(scores, score > 0), score * weight)) >= threshold

# Date calculation chain
dateDiff(dateAdd(startDate, 30, "days"), now(), "days") <= 0
```

### Conditional Expressions

Ternary-like expressions using logical operators:

```dsl
# Using logical operators for conditional logic
(age >= 65 && retirementEligible) || (age < 65 && yearsOfService >= 30)

# Complex conditional validation
(type == "premium" && features.length >= 5) || 
(type == "standard" && features.length >= 2) || 
(type == "basic" && features.length >= 1)
```

### Pattern Matching

Advanced pattern matching using regular expressions:

```dsl
# Email pattern
matches(email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")

# Phone pattern
matches(phone, "^\\+?[1-9]\\d{1,14}$")

# Custom ID pattern
matches(id, "^[A-Z]{2}\\d{6}$")
```

### Error Handling

Graceful error handling in expressions:

```dsl
# Safe navigation
user.profile?.name == "John" || user.profile?.name == null

# Default value fallback
withDefault(user.preferences?.theme, "light", true)

# Conditional existence check
ifExists(metadata?.tags, length(metadata.tags) > 0)
```

## Best Practices

### 1. Readability

**Use descriptive field names:**
```dsl
# Good
userAge > minimumRequiredAge && accountStatus == "active"

# Avoid
a > b && s == "act"
```

**Break complex expressions:**
```dsl
# Good
isEligibleAge = age >= 18 && age <= 65
hasValidStatus = status in ["active", "pending", "trial"]
hasRequiredLevel = level >= requiredMinimumLevel

isEligible = isEligibleAge && hasValidStatus && hasRequiredLevel

# Avoid (too complex in one line)
isEligible = age >= 18 && age <= 65 && status in ["active", "pending", "trial"] && level >= requiredMinimumLevel && !deleted && verified
```

### 2. Performance

**Use specific comparisons:**
```dsl
# Good (faster)
status == "active"

# Avoid (slower)
contains(["active", "pending", "trial"], status) && status == "active"
```

**Avoid expensive operations in loops:**
```dsl
# Good
validItems = filter(items, item.price > 0)
totalValue = sum(map(validItems, item.price * item.quantity))

# Avoid
totalValue = sum(map(items, item.price > 0 ? item.price * item.quantity : 0))
```

### 3. Maintainability

**Use context variables for configuration:**
```dsl
# Good
age >= ${policy.minimumAge} && score >= ${requirements.minimumScore}

# Avoid hardcoded values
age >= 18 && score >= 80
```

**Document complex logic:**
```dsl
# User must be of legal age and meet experience requirements
# OR be a special case (military veteran with alternative qualification)
(age >= 21 && experience >= 2) || 
(veteranStatus == true && alternativeQualification == true)
```

### 4. Error Prevention

**Validate input types:**
```dsl
# Good
typeof(age) == "number" && age > 0

# Check for null/undefined
email != null && isEmail(email)
```

**Use safe navigation:**
```dsl
# Good
user?.profile?.preferences?.theme == "dark"

# Avoid potential null reference errors
user.profile.preferences.theme == "dark"
```

### 5. Testing

**Create testable expressions:**
```dsl
# Good (easily testable components)
ageRequirement = age >= 18
statusRequirement = status == "active"
levelRequirement = level >= 3

finalEligibility = ageRequirement && statusRequirement && levelRequirement

# Each component can be tested independently
```

## Examples

### User Validation Rules

**Basic eligibility:**
```dsl
age >= 18 && 
status == "active" && 
emailVerified == true
```

**Premium user requirements:**
```dsl
(subscriptionType == "premium" || subscriptionType == "enterprise") &&
accountAge >= 30 &&
paymentStatus == "current" &&
!(suspended == true || banned == true)
```

**Role-based access:**
```dsl
(role == "admin") ||
(role == "moderator" && department == "support") ||
(role == "user" && isOwner == true)
```

### Content Validation

**Article publishing rules:**
```dsl
length(title) >= 10 && length(title) <= 100 &&
length(content) >= 500 &&
category in ["tech", "science", "business", "health"] &&
author.verified == true &&
!(contains(lower(content), "spam") || contains(lower(content), "advertisement"))
```

**File upload validation:**
```dsl
fileSize <= ${global.maxFileSize} &&
extension in ${global.allowedExtensions} &&
!contains(filename, "../") &&
mimeType.startsWith("image/") &&
dimensions.width <= 4096 && dimensions.height <= 4096
```

### Business Logic

**Order processing:**
```dsl
# Order can be processed if:
# - Customer has valid payment method
# - All items are in stock
# - Shipping address is complete
# - Total amount is within limits

hasValidPayment = paymentMethod != null && paymentMethod.verified == true
allItemsInStock = every(items, item.quantity <= item.inventory.available)
hasCompleteAddress = shipping.address != null && 
                    shipping.address.country != null && 
                    shipping.address.postalCode != null
withinLimits = total >= ${policy.minimumOrder} && total <= ${user.maxOrderLimit}

canProcessOrder = hasValidPayment && allItemsInStock && hasCompleteAddress && withinLimits
```

**Pricing rules:**
```dsl
# Dynamic pricing based on user tier and volume
basePrice = product.basePrice

# Volume discounts
volumeDiscount = quantity >= 100 ? 0.15 : (quantity >= 50 ? 0.10 : (quantity >= 20 ? 0.05 : 0))

# User tier discounts
tierDiscount = user.tier == "platinum" ? 0.20 : (user.tier == "gold" ? 0.15 : (user.tier == "silver" ? 0.10 : 0))

# Seasonal promotions
seasonalDiscount = ${promotion.active} == true && 
                   now() >= "${promotion.startDate}" && 
                   now() <= "${promotion.endDate}" ? ${promotion.discount} : 0

# Calculate final price
maxDiscount = max(volumeDiscount, tierDiscount, seasonalDiscount)
finalPrice = basePrice * (1 - maxDiscount)
```

### Advanced Scenarios

**Multi-factor authentication requirements:**
```dsl
# MFA required for:
# - Admin users always
# - High-risk actions
# - Access from new devices
# - Sensitive data access

requiresMFA = 
  (role == "admin") ||
  (action in ["delete", "export", "configure"]) ||
  (device.isNew == true && !device.isTrusted) ||
  (dataClassification == "sensitive" || dataClassification == "confidential") ||
  (accessLocation.country != ${user.homeCountry} && risk.score > ${security.maxRiskScore})
```

**Content recommendation engine:**
```dsl
# Recommend content based on:
# - User preferences and history
# - Content quality and recency
# - Social signals
# - Personalization factors

userInterest = category in ${user.preferences.categories} && 
               tags.some(tag => tag in ${user.interests.tags})

contentQuality = rating >= 4.0 && 
                 views > 1000 && 
                 dateDiff(now(), publishedAt, "days") <= 30

socialSignals = likes > 10 && 
                shares > 5 && 
                comments.filter(comment => comment.sentiment == "positive").length > 2

personalization = language == "${user.preferences.language}" && 
                  difficulty <= ${user.level} && 
                  estimatedReadTime <= ${user.preferences.maxReadTime}

shouldRecommend = userInterest && contentQuality && socialSignals && personalization
```

## Troubleshooting

### Common Syntax Errors

**Unclosed Parentheses:**
```dsl
# Error
age > 18 && (status == "active"
# Fix
age > 18 && (status == "active")
```

**Missing Operators:**
```dsl
# Error
age 18
# Fix
age > 18
```

**Invalid String Quotes:**
```dsl
# Error
name == 'John's Account'
# Fix
name == "John's Account"
# Or
name == 'John\'s Account'
```

### Type Errors

**String/Number Confusion:**
```dsl
# Error (comparing string to number)
age == "18"
# Fix
age == 18
# Or if age is stored as string
age == "18"
```

**Array Access:**
```dsl
# Error (wrong syntax)
items.0.name == "first"
# Fix
items[0].name == "first"
```

### Context Variable Issues

**Missing Variables:**
```dsl
# Error (undefined variable)
age > ${user.missingField}
# Fix: Define the variable or use default
age > withDefault(${user.minimumAge}, 18)
```

**Scope Issues:**
```dsl
# Error (wrong scope)
department == "${session.department}"
# Fix (correct scope)
department == "${user.department}"
```

### Performance Issues

**Complex Expressions:**
```dsl
# Warning: High complexity
result = (a && b && c && d && e) || (f && g && h && i && j) || ... (many more conditions)

# Fix: Break into smaller parts
groupA = a && b && c && d && e
groupB = f && g && h && i && j
result = groupA || groupB || ...
```

**Expensive Function Calls:**
```dsl
# Warning: Expensive operation in loop
forEach(largeArray, contains(item.description, "searchTerm"))

# Fix: Pre-filter or use more efficient approach
filteredItems = filter(largeArray, contains(item.description, "searchTerm"))
```

### Debugging Tips

1. **Use parentheses** to clarify operator precedence
2. **Break complex expressions** into smaller, named parts
3. **Validate context variables** are properly defined
4. **Check data types** match expected values
5. **Use the expression editor's** real-time validation
6. **Test with sample data** before deploying rules
7. **Monitor performance metrics** for complex expressions

### Getting Help

- Check the **real-time validation** messages in the expression editor
- Use the **autocomplete suggestions** for correct syntax
- Refer to the **API documentation** for function signatures
- Test expressions with **sample data** in the preview panel
- Enable **debug mode** for detailed parsing information