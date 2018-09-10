/**
 Shows the shape and control points of {{#crossLink "SplineCurve"}}{{/crossLink}}

 @class SplineCurveHelper
 @module meshes
 @extends Component
 */
xeogl.SplineCurveHelper = class xeoglSplineCurveHelper extends xeogl.Component {

    init(cfg) {
        super.init(cfg);
        this._divisions = 100;

        this._splineCurve = cfg.splineCurve;
        if (this._splineCurve) {
            const self = this;
            this._onPathCurves = this._splineCurve.on("curves", () => {
                self._needUpdate();
            });
        }
    }

    _update() {
        if (this._line) {
            this._line.geometry.destroy();
            this._line.material.destroy();
            this._line.destroy();
        }
        const splineCurve = this._splineCurve;
        if (!splineCurve) {
            return;
        }
        const points = splineCurve.getPoints(this._divisions);
        const positions = [];
        let point;
        for (var i = 0, len = points.length; i < len; i++) {
            point = points[i];
            positions.push(point[0]);
            positions.push(point[1]);
            positions.push(point[2]);
        }
        const indices = [];
        for (var i = 0, len = points.length - 1; i < len; i++) {
            indices.push(i);
            indices.push(i + 1);
        }
        this._line = new xeogl.Mesh(this, {
            geometry: new xeogl.Geometry(this, {
                primitive: "lines",
                positions: positions,
                indices: indices
            }),
            material: new xeogl.PhongMaterial(this, {
                diffuse: [1, 0, 0]
            })
        });
    }

    /**
     The SplineCurve for this SplineCurveHelper.

     @property splinecurve
     @type {SplineCurve}
     @final
     */

    get splineCurve() {
        return this._splineCurve;
    }

    destroy() {
        if (this._splineCurve) {
            this._splineCurve.off(this._onPathCurves);
        }
        super.destroy();
    }
};