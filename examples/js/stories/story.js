/**
 A **Story** defines a panel of text generated from markdown.

 Story is the base class for:

 * {{#crossLink "AnnotationStory"}}{{/crossLink}} - a list of
 {{#crossLink "Annotation"}}Annotations{{/crossLink}} accompanied by a panel of text containing links
 that activate them.

 @class Story
 @module xeogl
 @submodule stories
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Story in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Story.
 @param [cfg.text=""] {String} Story text in markdown format.
 @extends Component
 */
{
    var converter = new showdown.Converter();

    function idToString(id) {
        return xeogl._isNumeric(id) ? id : ("'" + id + "'");
    }

    xeogl.Story = class xeoglStory extends xeogl.Component {

        init(cfg) {
            this._container = document.createElement("div");
            this._container.className = "xeogl-story";
            document.body.appendChild(this._container);
            this._actions = cfg.actions || {};
            this.text = cfg.text;
        }

        set text(value) {
            this._text = value || [];
            this._updateText();
        }

        get text() {
            return this._text;
        }

        _updateText() {
            var text = this._text.join("\n");
            for (var action in this._actions) {
                if (this._actions.hasOwnProperty(action)) {
                    text = text.split(action + "(").join("javascript:xeogl.scenes[" +
                        idToString(this.scene.id) + "].components[" + idToString(this.id) + "]._actions." + action + ".call(xeogl.scenes[" +
                        idToString(this.scene.id) + "].components[" + idToString(this.id) + "],");
                }
            }
            this._container.innerHTML = converter.makeHtml(text);
        }

        _clear() {
            this._text = [];
            this._container.innerHTML = "";
        }

        _getJSON() {
            return {
                text: this._text.slice()
            };
        }

        destroy() {
            super.destroy();
            this._container.parentNode.removeChild(this._container);
        }
    }
}
