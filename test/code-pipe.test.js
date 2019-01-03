import {parseCode} from '../src/js/code-parser';
import {createCFG} from '../src/js/code-pipe';
import {createColoredPath} from '../src/js/code-pipe';
import {buildDot} from '../src/js/code-pipe';
import assert from 'assert';

describe('color nodes', () => {
    it('color simple function', () => {
        let code =
            'function simp(a){return 79;}';
        let parsedCode = parseCode(code);
        let actual = createCFG(parseCode(code));
        createColoredPath(actual, parsedCode, '78');
        assert.equal(actual[0].color, true);
        assert.equal(actual.length, 1);
        
    });

    it('color simple function2', () => {
        let code =
            'function simp(a,b){return 729;}';
        let parsedCode = parseCode(code);
        let actual = createCFG(parseCode(code));
        createColoredPath(actual, parsedCode, '78,[1,3]');
        assert.equal(actual[0].color, true);
        assert.equal(actual.length, 1);
        
    });

    it('check if color', () => {
        let code =
            'function checker(x,y){\n' +
            '   var bool = false;\n' +
            '   if (x > -13 && y < 0){\n' +
            '       y = 1;\n' +
            '       x = 3;\n' +
            '   } else\n' +
            '       y = -10;\n' +
            '   return bool;\n' +
            '}';
        let params = '20,-1';
        let parsedCode = parseCode(code);
        let actual = createCFG(parseCode(code));
        createColoredPath(actual, parsedCode, params);

        assert.equal(actual.length, 5);
        assert.equal(actual[0].color, true);
        assert.equal(actual[3].color, true);
        assert.equal(actual[4].color, undefined);
    });

    it('check if color2', () => {
        let code =
            'function checker(x,y){\n' +
            '   let c = 1;\n' +
            '   if (x > 13 && y < 0){\n' +
            '       y = 1;\n' +
            '       x = 3;\n' +
            '   } else {\n' +
            '       y = 10;\n' +
            '   }\n'+
            '   return c;\n' +
            '}';
        let params = '10,1';
        let parsedCode = parseCode(code);
        let actual = createCFG(parseCode(code));
        createColoredPath(actual, parsedCode, params);

        assert.equal(actual.length, 5);
    });

    it('check global while if', () => {
        let code =
            'let x = 15;\n' +
            'function checkIf(x,y){\n' +
            '   let a = true;\n' +
            '   while (x == 21 && 2 >1){\n' +
            '       x = 21;\n' +
            '       y = 10;\n' +
            '       a = false;\n' +
            '       if (x == 21)\n' +
            '           x = 2;\n' +
            '       else\n' +
            '           x = 0\n;' +
            '   }\n' +
            '   return a;\n' +
            '}';
        let actual = createCFG(parseCode(code));
        let params = '21,52';
        let parsedCode = parseCode(code);
        createColoredPath(actual, parsedCode, params);
        assert.equal(actual[5].color, undefined);
        assert.equal(actual.length, 7);
        assert.equal(actual[0].color, true);
        assert.equal(actual[1].color, true);
        assert.equal(actual[4].color, true);
        assert.equal(actual[6].color, true);
    });

});

describe ('check array', () =>{
    it('check array and if', () => {
        let code =
            'function checkArr(x, y){\n' +
            '   var a = [43,46,59];\n' +
            '   while (a[0] == 43 && x[0]==62){\n' +
            '       a[0] = x[1];\n' +
            '   }\n' +
            '   return a;\n' +
            '}';
        let params = '[62,132],\'shay, ben\'';
        let parsedCode = parseCode(code);
        let actual = createCFG(parseCode(code));
        createColoredPath(actual, parsedCode, params);
        assert.equal(actual[0].color, true);
        assert.equal(actual.length, 4);
        
    });
});

    describe('dot', () => {
        it('dot simple func', () => {
            let code =
                'function foo(x){return 89;}';
            let params = 'x=1';
            let parsedCode = parseCode(code);
            let cfg = createCFG(parseCode(code));
            createColoredPath(cfg, parsedCode, params);
            let actual = buildDot(cfg);
            let expected = 'digraph cfg { ' +
                'n0 [label="return 89;" xlabel=1 style = filled fillcolor = SpringGreen3 shape="box"]\n }';
            assert.equal(actual, expected);
        });
    
        it('dot with if', () => {
            let code =
                'function checkIf(param){\n' +
                '   var bool = true;\n' +
                '   if (param > 14){\n' +
                '       bool = false;\n' +
                '       param = 55;\n' +
                '   } else\n' +
                '       param = 10;\n' +
                '   return param;\n' +
                '}';
            let params = '43';
            let parsedCode = parseCode(code);
            let cfg = createCFG(parseCode(code));
            createColoredPath(cfg, parsedCode, params);
            let actual = buildDot(cfg);
            let expected = 'digraph cfg { ' +
                'n0 [label="var bool = true;" xlabel=1 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n1 [label="param > 14" xlabel=2 style = filled fillcolor = SpringGreen3 shape="diamond"]\n' +
                'n2 [label="bool = false\nparam = 55" xlabel=3 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n3 [label="return param;" xlabel=4 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n4 [label="param = 10" xlabel=5 shape="box"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 [label=\"T\"]\n' +
                'n1 -> n4 [label=\"F\"]\n' +
                'n2 -> n3 []\n' +
                'n4 -> n3 []\n' +
                ' }';
            assert.equal(actual, expected);
        });
    
        it('dot with globals, while and if', () => {
            let code =
                'let temp = 1;\n' +
                'function foo(a){\n' +
                '   let check = false;\n' +
                '   while (temp == 1){\n' +
                '       a = 1;\n' +
                '       check = true;\n' +
                '       if (a == 1)\n' +
                '           temp = 3;\n' +
                '       else\n' +
                '           temp = 66\n;' +
                '   }\n' +
                '   return check;\n' +
                '}';
            let params = '2';
            let parsedCode = parseCode(code);
            let cfg = createCFG(parseCode(code));
            createColoredPath(cfg, parsedCode, params);
            let actual = buildDot(cfg);
            let expected = 'digraph cfg { ' +
                'n0 [label="let check = false;" xlabel=1 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n1 [label="temp == 1" xlabel=2 style = filled fillcolor = SpringGreen3 shape="diamond"]\n' +
                'n2 [label="a = 1\ncheck = true" xlabel=3 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n3 [label="a == 1" xlabel=4 style = filled fillcolor = SpringGreen3 shape="diamond"]\n' +
                'n4 [label="temp = 3" xlabel=5 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n5 [label="temp = 66" xlabel=6 shape="box"]\n' +
                'n6 [label="return check;" xlabel=7 style = filled fillcolor = SpringGreen3 shape="box"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 [label=\"T\"]\n' +
                'n1 -> n6 [label=\"F\"]\n' +
                'n2 -> n3 []\n' +
                'n3 -> n4 [label=\"T\"]\n' +
                'n3 -> n5 [label=\"F\"]\n' +
                'n4 -> n1 []\n' +
                'n5 -> n1 []\n' +
                ' }';
            assert.equal(actual, expected);
        });
    });
