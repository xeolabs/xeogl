addPrettify();
addFeatures();

function addPrettify() {
    var els = document.querySelectorAll('pre');
    for (var i = 0, el; el = els[i]; i++) {
        if (!el.classList.contains('noprettyprint')) {
            el.classList.add('prettyprint');
        }
    }
    var el = document.createElement('script');
    el.type = 'text/javascript';
    el.src = 'assets/js/prettify.js';
    el.onload = function () {
        prettyPrint();
    };
    document.body.appendChild(el);
}

function addFeatures() {
    $.ajax({
        type: 'GET',
        url: 'assets/json/features.json',
        dataType: 'json',
        success: function (features) {

            var featureList = $('#featureList');

            var rowElem = $('<div class="row">')
                .appendTo(featureList);

            var category;

            var needUL = true;

            var len = 0;

            var columnElem = $('<div/>')
                .addClass('col-sm-4')
                .appendTo(rowElem);

            for (var categoryName in features) {
                if (features.hasOwnProperty(categoryName)) {

                    category = features[categoryName];

                    var str = ["<h4>", categoryName, "</h4>"];

                    needUL = true;

                    for (var j = 0, lenj = category.length; j < lenj; j++) {

                        var feature = category[j];

                        if (feature.charAt(0) === "#") {

                            str.push("<br><p>");
                            str.push(parse(feature.substring(1)));
                            str.push("</p>");

                        } else {

                            if (needUL) {
                                str.push("<ul '>");
                                needUL = false;
                            }

                            str.push("<li>");
                            str.push(parse(feature));
                            str.push("</li>");
                        }
                    }

                    str.push("</ul>");

                    $(str.join("")).appendTo(columnElem);

                    len += str.length;

                    if (len > 50) {

                        columnElem = $('<div style="border-left: 1px solid #CCCCCC;"/>')
                            .addClass('col-sm-4')
                            .appendTo(rowElem);

                        len = 0;
                    }
                }
            }
        }
    });
}

function parse(markdown) {
    //return markdown.replace(/\[\[([^|]*?)\|(.*?)\]\]/g, '<a href="javascript:Window.__openLink(\'$2\')">$1</a>');
    return markdown.replace(/\[\[([^|]*?)\|(.*?)\]\]/g, '<a href="../examples/index.html#$2" target="_examples">$1</a>');
}

Window.__openLink = function (ref) {
    var url = (ref.substring(0, 4) === "http") ? ref : "examples/#" + ref;
    window.location = url;
};
