with open('samples.js', 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = r'(\"You guessed: %s\" & guessed) >> Format >> Display.'
good_str = r'\"You guessed: {guessed}\" >> Display.'

if bad_str in content:
    content = content.replace(bad_str, good_str)
    with open('samples.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed formatting logic in samples.js')
else:
    print('Could not find string in samples.js')
