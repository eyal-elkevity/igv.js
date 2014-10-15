/**
 * Created by turner on 2/11/14.
 */
var igv = (function (igv) {


    igv.WIGTrack = function (config) {

        this.config = config;
        this.url = config.url;

        if (config.url.endsWith(".bedgraph") || config.url.endsWith(".bedgraph.gz")) {

            this.featureSource = new igv.BEDGraphFeatureSource(config.url);

        } else if (config.url.endsWith(".wig") || config.url.endsWith(".wig.gz")) {

            this.featureSource = new igv.WIGFeatureSource(config.url);

        } else if (config.url.endsWith(".bw") || config.url.endsWith(".bigwig") || config.type === "bigwig") {

            this.featureSource = new igv.BWSource(config.url);
        }


        this.label = config.label;
        this.id = config.id || this.label;
        this.color = config.color || "rgb(150,150,150)";
        this.height = 100;
        this.order = config.order;

        // Min and max values.  No defaults for these, if they aren't set track will autoscale.
        this.min = config.min;
        this.max = config.max;

    };

    /**
     *
     * @param canvas -- a "fabric canvas",  fabricjs.com  (not a Canvas2D)
     * @param refFrame
     * @param bpStart
     * @param bpEnd
     * @param width
     * @param height
     * @param continuation
     */

        //  this.track.draw(igvCanvas, refFrame, tileStart, tileEnd, buffer.width, buffer.height, function () {

    igv.WIGTrack.prototype.draw = function (canvas, refFrame, bpStart, bpEnd, width, height, continuation) {

        var track = this,
            chr = refFrame.chr;

        this.featureSource.getFeatures(chr, bpStart, bpEnd, function (features) {

            var featureMin, featureMax, denom;

            if (features && features.length > 0) {
                featureMin = this.min;
                featureMax = this.max;
                if(!featureMin || !featureMax) {
                    var s = autoscale(features);
                    featureMin = s.min;
                    featureMax = s.max;
                }
                denom = featureMax - featureMin;

                features.forEach(renderFeature);
            }

            continuation();

            function renderFeature(feature, index, featureList) {

                var centroid = 128,
                    delta = 32,
                    rectOrigin,
                    rectEnd,
                    rectWidth,
                    rectHeight,
                    rectBaseline,
                    rect;

                if (feature.end < bpStart) return;
                if (feature.start > bpEnd) return;

                rectOrigin = refFrame.toPixels(feature.start - bpStart);
                rectEnd = refFrame.toPixels(feature.end - bpStart);
                rectWidth = Math.max(1, rectEnd - rectOrigin);
                rectHeight = ((feature.value - featureMin) / denom) * height;
                rectBaseline = height - rectHeight;

                canvas.fillRect(rectOrigin, rectBaseline, rectWidth, rectHeight, {fillStyle: track.color});

            }
        });
    };


    igv.WIGTrack.prototype.drawLabel = function (ctx) {
        // draw label stuff
    };

    function autoscale(features) {
        var min = Number.MAX_VALUE,
            max = -Number.MAX_VALUE;

        features.forEach(function(f) {
            min = Math.min(min, f.value);
            max = Math.max(max, f.value);
        });

        return {min: min, max: max};

    }

    return igv;

})(igv || {});
