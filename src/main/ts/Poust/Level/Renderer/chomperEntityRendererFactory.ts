﻿function chomperEntityRendererFactory(lineWidth: number, strokeStyle: any, fillStyle: any) {
    return function (context: CanvasRenderingContext2D, entity: IEntity): void {

        var bounds = entity.getBounds();

        var ir = bounds.getInnerRadiusPx();
        if (ir > 0) {
            context.strokeStyle = strokeStyle;
            livingEntityRendererContextSetup(context, fillStyle, entity);
            context.lineWidth = lineWidth;

            var chomper = <IChomperEntity>entity;

            var scale = ageToScale(entity, 1000);

            var rotation = (pi / 6) * scale;

            var acr = bounds.getCenterAngleRadians();
            var sincr = Math.sin(acr);
            var coscr = Math.cos(acr);

            var bottomx = coscr * ir;
            var bottomy = sincr * ir;
            var height = bounds.getHeightPx();
            var toothWidth = height / 5;
            var heightRaised = height + toothWidth / 2;
            var car = bounds.getCenterAngleRadians() + pid2;

            context.save();
            context.translate(bottomx, bottomy);

            var f = function (context: CanvasRenderingContext2D, h: number, tw: number, out: boolean) {
                var ox = 0;
                var ix: number;
                if (out) {
                    ix = -tw / 2;
                } else {
                    ix = tw / 2;
                }
                while (h > tw) {
                    h -= tw;
                    context.lineTo(ix, -(h + tw / 2));
                    context.lineTo(ox, -h);
                }
            }

            var xscale: number;
            if (chomper._flipped) {
                xscale = -1;
            } else {
                xscale = 1;
            }

            // draw left petal
            context.save();
            context.rotate(-rotation * xscale + car);
            context.scale(xscale, 1);
            context.beginPath();
            context.moveTo(0, 0);
            context.arc(0, -height / 2, height / 2, pid2, -pid2, false);
            f(context, height, toothWidth, true);
            context.restore();

            // draw right petal
            context.save();
            context.rotate(rotation * xscale + car);
            context.scale(xscale, 1);
            context.arc(0, -heightRaised / 2, heightRaised / 2, pid2, -pid2, true);
            f(context, heightRaised, toothWidth, false);
            context.closePath();
            context.restore();

            context.restore();

            context.fill();
            context.stroke();
        }

        livingEntityRendererContextRestore(context);

    }
}