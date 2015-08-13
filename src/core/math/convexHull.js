/**
 * 2D implementation of Quickhull, which finds the convex hull for scattered points
 * using a divide and conquer strategy that's similar to Quicksort.
 *
 * @param points Array points, each a 2-element vector
 * @returns {Array} Array of hull vertices, each a two-element vector
 */
XEO.math.getConvexHull2D = (function () {

    // This is a higher-order function, ie. returning another function at the end

    var allBaseLines = [];

    function buildConvexHull(baseLine, points) {
        allBaseLines.push(baseLine);
        var convexHullBaseLines = [];
        var t = findMostDistantPointFromBaseLine(baseLine, points);
        if (t.maxPoint.length) {
            convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([baseLine[0], t.maxPoint], t.newPoints));
            convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints));
            return convexHullBaseLines;
        } else {
            return [baseLine];
        }
    }

    function findMostDistantPointFromBaseLine(baseLine, points) {
        var maxD = 0;
        var maxPt = [];
        var newPoints = [];
        for (var i = 0, len = points.length; i < len; i++) {
            var pt = points[i];
            var d = getDistant(pt, baseLine);
            if (d > 0) {
                newPoints.push(pt);
            } else {
                continue;
            }
            if (d > maxD) {
                maxD = d;
                maxPt = pt;
            }
        }
        return {'maxPoint': maxPt, 'newPoints': newPoints}
    }

    function getDistant(cpt, bl) {
        var Vy = bl[1][0] - bl[0][0];
        var Vx = bl[0][1] - bl[1][1];
        return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] - bl[0][1]))
    }

    return function (points) {

        //find first baseline
        var maxX = -10000000000000;
        var minX = +10000000000000;
        var maxPt, minPt;
        for (var i = 0, len = points.length; i < len; i++) {
            var pt = points[i];
            if (pt[0] > maxX) {
                maxPt = pt;
                maxX = pt[0];
            }
            if (pt[0] < minX) {
                minPt = pt;
                minX = pt[0];
            }
        }
        return  [].concat(buildConvexHull([minPt, maxPt], points),
            buildConvexHull([maxPt, minPt], points));
    };

})();
