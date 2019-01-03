import assert from 'assert';
var codeAnalayzer = require('../src/js/code-analyzer');

describe('Program BlockStatement FunctionDeclaration Identifier', () => {
    it('parsing program with simple function', () => {
        var testProgram= 'function binarySearch(X, V, n) {\n}';
        var expected = 'function binarySearch(X, V, n) {<br>}';
        var inputVal = ['x = 1']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
    it('color program with simple function', () => {
        var testProgram= 'function binarySearch(x) {\n}';
        var expected = 'function binarySearch(x) {<br>}';
        var inputVal = ['x = 1']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
});


describe('BinaryExpression Literal VariableDeclaration', () => {
    it('parsing program with simple let expression', () => {
        var testProgram= 'let x = x + 5;';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output,
            testProgram
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple let expression', () => {
        var testProgram= 'let x;';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        assert.equal(
            codeAnalayzer.escodegen.generate(codeAnalayzer.parseProgram(testJson)).replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            'letx;'
        );
        codeAnalayzer.resetAll();
    });
});

describe('Function assignment op', () => {
    it('parsing program with assignment op', () => {
        var testProgram= 'function foo(x){\nx = 3;\n}';
        var expected = 'function foo(x) {<br>    x = 3;<br>}';
        var inputVal = ['x=1']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
});

describe('Global', () => {
    it('parsing program with simple let expression2', () => {
        var testProgram= 'let i;\ni = 5;';
        var expected = 'let i;<br>i = 5;';
        var inputVal = ['x=1']; 
        assert.equal(
            codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal),
            expected
        );
        codeAnalayzer.resetAll();
    });
});

describe('resetInput', () => {
    it('parsing program with simple reset expression', () => {
        codeAnalayzer.resetAll();
        codeAnalayzer.resetInput();
        assert.equal(
            codeAnalayzer.input.length,
            0
        );
        codeAnalayzer.resetAll();
    });
});

describe('UpdateExpression AssignmentExpression ExpressionStatement', () => {
    it('parsing program with simple let expression', () => {
        var testProgram= 'i++;\nx = x + 5;';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output,
            testProgram
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple let expression', () => {
        var testProgram= '++i;\nx = x + 5;';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output,
            testProgram
        );
        codeAnalayzer.resetAll();
    });
});

describe('WhileStatement', () => {
    it('parsing program with simple while expression', () => {
        var testProgram= 'function foo(x){\nwhile(x<5){\n   x = 5;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});
describe('IfStatement', () => {
    it('parsing program with simple if expression1', () => {
        var testProgram= 'function foo(x){\nif(x <= 5 & y>7){\n   y = 5;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple if expression2', () => {
        var testProgram= 'function foo(x){\nif(x>1){\ny=1;\n}\nelse if(x==0){\ny = 0;\n}\nelse{\ny = -1;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('WhileStatement', () => {
    it('parsing program with simple if expression3', () => {
        var testProgram= 'function foo(x){\nif(x>1){\ny=1;\n}\nelse if(x==0){\ny=0;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});
describe('WhileStatement', () => {
    it('parsing program with simple if expression4', () => {
        var testProgram= 'function foo(x){\nif(x>1){\ny=1;\n}\nelse if(x==0){\ny=0;\n}\nelse if(x<1){\ny=-1;\n}\n}\n';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('MemberExp', () => {
    it('parsing member exp', () => {
        var testProgram= 'function foo(x){\nif(x[0]>1){\ny=1;\n}\nelse if(x==0){\ny=0;\n}\nelse if(x<1){\ny=-1;\n}\n}\n';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('IfStatement LogicalExpression', () => {
    it('parsing program with simple if expression5', () => {
        var testProgram= 'function foo(x){\nif(x >= 5 && y>7){\ny = 5;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple if expression and', () => {
        var testProgram= 'function foo(x){\nif(x >= 5 && y>7){\ny = 5;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple if expression or', () => {
        var testProgram= 'function foo(x){\nif(x >= 5 || y>7){\ny = 5;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('ReturnStatement', () => {
    it('parsing program with simple return literal expression', () => {
        var testProgram= 'function binarySearch(X, V, n){\nreturn n;\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
    it('parsing program with simple return unary expression', () => {
        var testProgram= 'function binarySearch(X, V, n){\nreturn -1;\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('ForStatement', () => {
    it('parsing program with simple for loop', () => {
        var testProgram= 'function foo(x){\nfor(i=10;i>0;i--){\nx=1;\n}\n}';
        var testJson = codeAnalayzer.parseCodeWithLine(testProgram);
        var output = codeAnalayzer.breakCode2(testJson);
        assert.equal(
            output.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, ''),
            testProgram.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '')
        );
        codeAnalayzer.resetAll();
    });
});

describe('Complicated program Coloring 1', () => {
    it('color program with simple function', () => {
        var testProgram= 'function foo(x, y, z){\nlet c = 5;\nc = 10;\nif (6 > 5 || 2 > 1) {\nreturn x + y + z + c;\n} else {\nreturn 5;\n}\n}';
        var expected = 'function foo(x, y, z) {<br>    if (<mark style=\'background-color:green\'>6 > 5 || 2 > 1</mark>) {<br>        return x + y + z + 10;<br>    } else {<br>        return 5;<br>    }<br>}';
        var inputVal = ['x=1', 'y=3', 'z=4']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
});

describe('Complicated program Coloring 2', () => {
    it('color program with simple function', () => {
        var testProgram= 'function foo(x, y, z){\nlet c = 5;\nc = 10;\nif (6 < 5 || 2 < 1) {\nreturn x + y + z + c;\n} else if (6 > 5 || 2 > 1) {\nreturn x + y + z + c;\n} else {\nreturn 5;\n}\n}';
        var expected = 'function foo(x, y, z) {<br>    if (<mark style=\'background-color:red\'>6 < 5 || 2 < 1</mark>) {<br>        return x + y + z + 10;<br>    } else if (<mark style=\'background-color:green\'>6 > 5 || 2 > 1</mark>) {<br>        return x + y + z + 10;<br>    } else {<br>        return 5;<br>    }<br>}';
        var inputVal = ['x=1', 'y=3', 'z=4']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
});

describe('Complicated program Coloring 2', () => {
    it('color program with simple function1', () => {
        var testProgram= codeAnalayzer.escodegen.generate(codeAnalayzer.parseCodeWithLine('let i = 0;\nfunction foo(x, y, z){\nlet a = x + 1;\nlet b = a + y;\nlet c = 0;\ni = 1;\nz=4;\nif (0 < i || 2<1) {\nc = c + 5;\nreturn x + y + z + c;\n} else if (b < z * 2) {\nc = c + x + 5;\nreturn x + y + z + c;\n} else {\nc = c + z + 5;\nreturn x + y + z + c;\n}\n}'));
        var expected = 'let i = 0;<br>function foo(x, y, z) {<br>    i = 1;<br>    z = 4;<br>    if (<mark style=\'background-color:green\'>0 < 1 || 2 < 1</mark>) {<br>        return x + y + 4 + (0 + 5);<br>    } else if (x + 1 + y < 4 * 2) {<br>        return x + y + 4 + (0 + x + 5);<br>    } else {<br>        return x + y + 4 + (0 + 4 + 5);<br>    }<br>}';
        var inputVal = ['x=1', 'y=3', 'z=4']; 
        var output = codeAnalayzer.colorCode(codeAnalayzer.parseCodeWithLine(testProgram),inputVal);
        assert.equal(
            output,
            expected
        );
        codeAnalayzer.resetAll();
    });
});