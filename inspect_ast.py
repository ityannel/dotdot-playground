import sys
sys.path.append('src')
from lexer import Lexer
from parser import Parser

text = '''::hp >> Num >> Catch(e): 0 .. >> check: is char::status == "poisoned": @ - 15. else: @. ..'''
p = Parser(Lexer(text).tokenize())
ast = p.parse_pipeline()
print(ast)
