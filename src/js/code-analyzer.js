import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCodeWithLine = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, range: true});
};

var globalVar = [];
var localVar = [];
var functionVar = [];
var beforeCodeColor = true;
var input = [];
var rangeArr = [];

var firstIteration = true;

const parseFunction = (codeToAnalyze) => {
    if(beforeCodeColor){
        codeToAnalyze.params.forEach((element) => {
            functionVar[element.name] = element.name;
        });
    }
    else{
        functionVar = Object.assign({},input); 
    }
    breakCode(codeToAnalyze.body);
};

const checkType = (element) =>{
    return (element.type == 'ExpressionStatement' && 
        element.expression.type == 'AssignmentExpression' && 
        element.expression.left.name in localVar);
};

const parseBlockStatement = (codeToAnalyze) => {
    var elementsToRemove = [];
    codeToAnalyze.body.forEach((element) => {
        breakCode(element);
        if(element.type == 'VariableDeclaration' && element.declarations.length == 0){
            elementsToRemove.push(element);
        }
        else if(checkType(element)){
            elementsToRemove.push(element);
        }    
    });
    elementsToRemove.forEach((temp) => {
        codeToAnalyze.body.splice(codeToAnalyze.body.indexOf(temp), 1);
    });
};

const identifier = (data) => {
    let name;
    if(data.name in localVar){
        name = data.name;
        return localVar[name];
    }
    if(data.name in functionVar){
        name = data.name;
        return functionVar[name];
    }
    if(data.name in globalVar){
        name = data.name;
        return globalVar[name];
    }
    return data.name;
};
const identifierLeftSide = (data) => {
    return data.name;
};
const literal = (data) =>{
    return data.raw;
};
const logicalExp = (data) => {
    data.left = parseCodeWithLine(parsingFunctions[data.left.type](data.left).toString()).body[0].expression;
    data.right = parseCodeWithLine(parsingFunctions[data.right.type](data.right).toString()).body[0].expression;
    return escodegen.generate(data);
};

const binaryExpression = (data) =>{
    data.left = parseCodeWithLine(parsingFunctions[data.left.type](data.left).toString()).body[0].expression;
    data.right = parseCodeWithLine(parsingFunctions[data.right.type](data.right).toString()).body[0].expression;
    return escodegen.generate(data);
};
const memberExp = (data) => {
    return parsingFunctions[data.object.type](data.object).toString()+
        '['+parsingFunctions[data.property.type](data.property).toString()+']';
};

const returnState = (data) => {
    parsingFunctions[data.argument.type](data.argument);
};
const unaryExp = (data) => {
    return data.operator.toString()+
        parsingFunctions[data.argument.type](data.argument).toString();
};

const handleInit = (data) => {
    return (data == null) ? '' : parsingFunctions[data.type](data);
};

const parseVarDecl = (codeToAnalyze) => {
    var elementsToRemove = [];
    codeToAnalyze.declarations.forEach((element) =>{
        if(!firstIteration){
            localVar[parsingFunctions[element.id.type](element.id)] = handleInit(element.init);
            elementsToRemove.push(element);
        }
        else
            globalVar[parsingFunctions[element.id.type](element.id)] = handleInit(element.init);
    });
    elementsToRemove.forEach((temp) => {
        codeToAnalyze.declarations.splice(codeToAnalyze.declarations.indexOf(temp), 1);
    });
};

const updateExp = (data) =>{
    parsingFunctions[data.argument.type](data.argument);
    (data.prefix)? data.operator.toString()+parsingFunctions[data.argument.type](data.argument).toString() : 
        parsingFunctions[data.argument.type](data.argument).toString()+data.operator.toString();
};
const assignExp = (data) =>{
    if(identifierLeftSide(data.left) in localVar){
        localVar[identifierLeftSide(data.left)] = parsingFunctions[data.right.type](data.right);
    }
    else if(identifierLeftSide(data.left) in functionVar)
        functionVar[identifierLeftSide(data.left)] = parsingFunctions[data.right.type](data.right);
    else if(identifierLeftSide(data.left) in globalVar)
        globalVar[identifierLeftSide(data.left)] = parsingFunctions[data.right.type](data.right);
};

const ExpStatement =
{
    'UpdateExpression' : updateExp,
    'AssignmentExpression' : assignExp
};

const parseExpressionStatement = (data) => {
    ExpStatement[data.expression.type](data.expression);
};
const parseWhile = (data) => {
    parsingFunctions[data.test.type](data.test);
    parsingFunctions[data.body.type](data.body);
};
 
const forExp = (data) =>{
    parsingFunctions[data.init.type](data.init);
    parsingFunctions[data.update.type](data.update);
    parsingFunctions[data.body.type](data.body);
};

const pushToRangeArr = (data,green) => {
    if(!beforeCodeColor && !green){
        green = eval(createProgramToEval(escodegen.generate(data.test)));
        rangeArr.push([data.test.range,green? 'green' : 'red']);
        return green;
    }
    return green;
};

const parseIf = (data, isGreen = false, elseIfStat=false) => {
    var green = isGreen, isIfStatment= elseIfStat, tempLocals = Object.assign({},localVar), tempFunctionVars = Object.assign({},functionVar), tempGlobalVars = Object.assign({},globalVar);
    parsingFunctions[data.test.type](data.test);
    parsingFunctions[data.consequent.type](data.consequent);
    localVar = Object.assign({},tempLocals);
    functionVar = Object.assign({},tempFunctionVars); 
    globalVar = Object.assign({},tempGlobalVars);
    green = pushToRangeArr(data,green);
    if(data.alternate!= null && data.alternate.type == 'IfStatement'){
        isIfStatment = true;
        parseIf(data.alternate,green,isIfStatment);
    }
    else if(data.alternate!=null)
        parsingFunctions[data.alternate.type](data.alternate);
};

const createProgramToEval = (test) =>{
    var program = '';
    for (const [ key, value ] of Object.entries(globalVar)) {
        program += 'let ' + key.toString() + ' = ' + value +';\n'; 
    }
    for (const [ key, value ] of Object.entries(functionVar)) {
        program += 'let ' + key.toString() + ' = ' + value +';\n'; 
    }
    for (const [ key, value ] of Object.entries(localVar)) {
        program += 'let ' + key.toString() + ' = ' + value +';\n'; 
    }
    program += test + ';';
    return program;
};

const parseProgram = (data) => {
    data.body.forEach((element) => {
        if(firstIteration && element.type != 'FunctionDeclaration'){
            parsingFunctions[element.type](element);
        }
        else{
            if(!firstIteration && element.type == 'FunctionDeclaration'){
                parsingFunctions[element.type](element);
            }
        }
    });
    if(firstIteration){
        firstIteration = false;
        parseProgram(data);
    }
    
    return data;
};

const parsingFunctions = 
{
    'FunctionDeclaration' : parseFunction,
    'Program' : parseProgram,
    'BlockStatement' : parseBlockStatement,
    'VariableDeclaration' : parseVarDecl,
    'ExpressionStatement' : parseExpressionStatement,
    'WhileStatement' : parseWhile,
    'IfStatement' : parseIf,
    'BinaryExpression' : binaryExpression,
    'Identifier' : identifier,
    'Literal' : literal,
    'MemberExpression' : memberExp,
    'LogicalExpression' : logicalExp,
    'ReturnStatement' : returnState,
    'UnaryExpression' : unaryExp,
    'ForStatement' : forExp,
    'UpdateExpression' : updateExp,
    'AssignmentExpression' : assignExp
};

const breakCode = (data) =>{
    return parsingFunctions[data.type](data);
};
const breakCode2 = (data) => {
    var temp = escodegen.generate(parsingFunctions[data.type](data));
    return temp;
};
function compare(a,b) {
    return a[0][0]>b[0][0];
}
const addColoring = (data) =>{
    var lastIndex =0 ;
    var newProgram = '';
    rangeArr.forEach((element)=>{
        newProgram += data.substring(lastIndex,element[0][0]) + 
        '<mark style=\'background-color:'+ element[1]+'\'>' +
        data.substring(element[0][0],element[0][1]) + 
        '</mark>';
        lastIndex = element[0][1];
    });
    newProgram += data.substring(lastIndex);
    return newProgram;
};
const colorCode = (data, inputArr) => {
    input = buildInputArr(inputArr);
    var first = parseCodeWithLine(breakCode2(data));
    beforeCodeColor = false;
    var codeBeforeColoring = escodegen.generate(first);
    breakCode2(first);
    rangeArr.sort(compare);
    return addColoring(codeBeforeColoring).replace(/\n/g,'<br>');
};

const buildInputArr = (inputArr) =>{
    var tempArr = [];
    inputArr.forEach((element) => {
        var splited = element.split('=');
        tempArr[splited[0]] = splited[1];
    });
    return tempArr;
};

const resetInput = () =>{
    globalVar = [];
    localVar = [];
    functionVar = [];
    beforeCodeColor = true;
    input = [];
    rangeArr = [];
    firstIteration = true;
};
const resetAll = () =>{
    globalVar = [];
    localVar = [];
    functionVar = [];
    beforeCodeColor = true;
    input = [];
    rangeArr = [];
    firstIteration = true;
};
export {parseProgram, parseCodeWithLine,escodegen, input,colorCode, breakCode2, beforeCodeColor, resetInput, resetAll};