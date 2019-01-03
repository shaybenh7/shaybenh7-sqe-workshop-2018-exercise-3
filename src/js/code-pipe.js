import {parseCode} from './code-parser';
import * as escodegen from 'escodegen';

//CODE EVAL
const parseExp = (data, functionParams) => parsingFunctions[data.type](data, functionParams);

const parseProgram = (data, functionParams) => {
    data.body.forEach((element) => {
        parseExp(element, functionParams);
    });
};
const handleFuncParam = (functionParams, param, index) =>{
    functionParams[param.name] = functionParams[index]; 
    delete functionParams[index];
};

const parseFunction = (data, functionParams) => {
    data.params.forEach((param, index) => {
        handleFuncParam(functionParams, param, index);
    });
};

const handleNotIdf = (data, functionParams) => {
    var arrMem = functionParams[data.left.object.name].slice(1, functionParams[data.left.object.name].length - 1).split(',');
    arrMem[data.left.property.value] = parseExp(data.right, functionParams);
    var joinedArr = arrMem.join(',');
    return '[' + joinedArr  + ']';
};

const handleIdf = (data, functionParams) => {
    var rightDataParsedExp = parseExp(data.right, functionParams);
    return rightDataParsedExp;
};

const assignExp = (data, functionParams) => {
    if (data.left.type !== 'Identifier') {
        functionParams[data.left.object.name] = handleNotIdf(data, functionParams);
    }
    else{
        functionParams[data.left.name] = handleIdf(data, functionParams);
    }
    return true;
};

const parseVarDecl = (data, functionParams) => {
    data.declarations.forEach(e => functionParams[e.id.name] = parseExp(e.init, functionParams));
    return true;
};

const parseUnary = (data, params) => {
    return eval(data.operator + parseExp(data.argument, params));
};

const parseExpressionStatement = (data, functionParams) => parseExp(data.expression, functionParams);

const handleArrBody = (data, functionParams) => data.elements.map(e => parseExp(e, functionParams)).join(',');

const arrayExp = (data, functionParams) => '[' + handleArrBody (data, functionParams) + ']';

const identifier = (data, functionParams) => functionParams[data.name];

const literal = (data) => data.raw;

const logicalExp = (data, functionParams) => eval(parseExp(data.left, functionParams) + data.operator + parseExp(data.right, functionParams));

const memberExp = (data, functionParams) => eval(parseExp(data.object, functionParams) + '[' + parseExp(data.property, functionParams) + ']');

const setAndEvalEnv = (parsedCode, params) => {
    var newParams = analyzeParam(params);
    parseExp(parsedCode, newParams);
    return newParams;
};

const calcString = (param , index, term) => {
    var stringBuild = param[index];
    var cond = param[index].endsWith(term);
    while (!cond){
        index++;
        stringBuild += ',';
        stringBuild += param[index];
        cond = param[index].endsWith(term);
    }
    return stringBuild;
};

const handleStringTerminators = (param, index, term) => {
    var tempIndex = index;
    var tempTerm = term;
    var stringBuild = calcString(param, tempIndex, tempTerm);
    var retVal = [];
    retVal.push([stringBuild,tempIndex]);
    return retVal[0];
};

const handleTrueFalse = (iter, functionParams) =>{
    var parsedNodeLabelBody = parseCode(iter.label).body[0];
    var checkIfExp = parseExp(parsedNodeLabelBody, functionParams); 
    if (checkIfExp){
        iter = iter.true;
    }
    else{
        iter = iter.false;
    }
    return iter;
};

const handleIfNormal  = (iter, functionParams) =>{
    var parsedNodeLabel = parseCode(iter.label);
    parseExp(parsedNodeLabel, functionParams);
    return iter.normal;
};

const createColoredPath = (controlFlowGraph, parsedCode, functionParams) => {
    functionParams = setAndEvalEnv(parsedCode, functionParams);
    var iter = controlFlowGraph[0];
    if(iter.type !== 'exit'){
        do {
            iter.color = true;
            var checkIfNoral = iter.normal;
            if (checkIfNoral)
                iter = handleIfNormal(iter, functionParams);
            else
                iter = handleTrueFalse(iter, functionParams);
        }
        while (iter.type !== 'exit');
        iter.color = true;
    }
    else
        iter.color = true;
};

const handleKindOfParam = (input) =>{
    let paramWithoutPsik = input.split(',');
    var paramWithOutVarName = '';
    if(input.includes('=')){
        for(var j=0;j<paramWithoutPsik.length;j++){
            var temp = paramWithoutPsik[j].split('=');
            paramWithOutVarName += temp[1];
        }
    }
    else{
        paramWithOutVarName = input;
    }
    return paramWithOutVarName;
};

const analyzeParam = (input) =>{
    var funcParams = {}, iter = 0;
    var inputArr = handleKindOfParam(input).split(',');
    for (var i = 0; i < inputArr.length; i++) {
        if (!inputArr[i].startsWith('\'')) {
            if (inputArr[i].startsWith('[')) {
                funcParams[iter] = handleStringTerminators(inputArr, i, ']')[0];
                i = handleStringTerminators(inputArr, i, ']')[1];
            } 
            else
                funcParams[iter] = inputArr[i];
        } 
        else{ 
            funcParams[iter] = handleStringTerminators(inputArr, i, '\'')[0];
            i = handleStringTerminators(inputArr, i, '\'')[1];
        }
        iter++;
    }
    return funcParams;
};

const parsingFunctions = {
    'Program': parseProgram,
    'BlockStatement': parseProgram,
    'ArrayExpression': arrayExp,
    'VariableDeclaration' : parseVarDecl,
    'ExpressionStatement': parseExpressionStatement,
    'Identifier': identifier,
    'BinaryExpression': logicalExp,
    'AssignmentExpression': assignExp,
    'LogicalExpression': logicalExp,
    'Literal': literal,
    'MemberExpression': memberExp,
    'FunctionDeclaration': parseFunction,
    'UnaryExpression': parseUnary,
};

//CREATE CFG FUNCTIONS
const extractFunctionBody = (exp) => {
    var typeFunc = 'FunctionDeclaration';
    var tempArr = [];
    exp.body.forEach((element) => {
        if(element.type == typeFunc){
            tempArr.push(element);
        }
    });
    return tempArr[0].body;
};

const createCFG = (parsedCode) => {
    const esgraph = require('esgraph');
    var cfgIndex = 2;
    var graph = esgraph(extractFunctionBody(parsedCode))[cfgIndex];
    graph.forEach(e => delete e.exception);
    var tempArr = [];
    graph[graph.length - 1].prev.forEach((element) => {
        var retStat = 'ReturnStatement';
        if(element.astNode.type === retStat){
            tempArr.push(element);
        }});
    handleEntry(graph);
    var lastNode = tempArr[0];
    handleExit(lastNode);
    graph = graph.slice(1, graph.length - 1);
    graph.forEach((element) => element.label = escodegen.generate(element.astNode));
    handleNormals(graph);
    return graph;
};

const handleEntry = (graph) => {
    graph[0].normal.type = 'entry';
    graph[0].normal.prev = [];
};

const handleExit = (lastNode) => {
    lastNode.type = 'exit';
    lastNode.next = [];
    delete lastNode.normal;
};

const handleNormals = (cfg) => {
    cfg.forEach((currNode) => {
        var i=0;
        while(i == 0){
            if (currNode.normal && currNode.normal.normal && currNode.normal.prev.length === 1){
                handleCurrNode(currNode, currNode.normal, cfg);
            }  
            else{
                i=1;
            }
        }
    });
};

const handleCurrNode = (currNode, nextNode, cfg) =>{
    currNode.label += '\n' + nextNode.label;
    currNode.normal = nextNode.normal;
    currNode.next = nextNode.next;
    cfg.splice(cfg.indexOf(nextNode), 1);
};

//CREATE DOT FUCNTIONS
const handleAllNodeTypes = (graph, dotArr, curr, index) => {
    if(curr['normal'])
        typedNode(graph, dotArr, curr, 'normal', index);
    if(curr['true'])
        typedNode(graph, dotArr, curr, 'true', index);
    if(curr['false'])
        typedNode(graph, dotArr, curr, 'false', index);
};

const handleEdge = (graph, dotArr) => {
    for (let [index, curr] of graph.entries()) {
        handleAllNodeTypes(graph, dotArr, curr, index);
    }
};

const buildDot = (graph) => {
    var dotArr = ['digraph cfg { '];
    for (let [index, curr] of graph.entries()) {
        dotArr.push(`n${index} [label="${curr.label}" xlabel=${index+1}`);
        if (curr.color){
            dotArr.push(' style = filled fillcolor = SpringGreen3');
        }
        dotArr.push(` shape="${(curr.true || curr.false)? 'diamond' : 'box'}"]\n`);
    }    
    handleEdge(graph, dotArr);
    dotArr.push(' }');
    return dotArr.join('');
};

const typedNode = (graph, dotArr, node, type, index) => {
    dotArr.push(`n${index} -> n${graph.indexOf(node[type])} [`);
    if (type == 'true'){
        dotArr.push(`label="${type.charAt(0).toUpperCase()}"`);
    }
    if (type == 'false'){
        dotArr.push(`label="${type.charAt(0).toUpperCase()}"`);
    }
    dotArr.push(']\n');
};

export {createColoredPath, createCFG, buildDot};