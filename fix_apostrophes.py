with open('/Users/tmac/Documents/Projects/Forgerank/app/auth/forgot-password.tsx', 'r') as f:
    content = f.read()

# Do the replacements with different HTML entities
content = content.replace("We've", "We've")
content = content.replace("don't", "don't")
content = content.replace("we'll", "we'll")
content = content.replace("We'll", "We'll")

with open('/Users/tmac/Documents/Projects/Forgerank/app/auth/forgot-password.tsx', 'w') as f:
    f.write(content)
