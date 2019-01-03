import $ from 'jquery';
import {parseCode} from './code-parser';
import {createColoredPath, createCFG, buildDot} from './code-pipe';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let parsedCode = parseCode($('#codePlaceholder').val());
        let graph = createCFG(parsedCode);
        createColoredPath(graph, parsedCode, $('#parametersPlaceholder').val());
        renderDot(buildDot(graph));
    });
});

function renderDot(dot){
    let graphElement = document.getElementById('codeCfg');
    var viz = new Viz({ Module, render });
    viz.renderSVGElement(dot)
        .then(function(element) {
            graphElement.innerHTML = '';
            graphElement.append(element);
        });
}
