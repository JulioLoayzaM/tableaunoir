import { Geometry } from './Geometry';
import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';

export class ActionFreeDraw extends Action {
    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }
    
    /**
     * @returns an object iff the freedraw is almost a line
     */
    isAlmostLine(): { angle: number } {
        const thesholdAngle = 0.15; //above it is not a line
        const thesholdDistance = 16; //below the angle is not evaluated
        const first = this.points[0];
        const last = this.points[this.points.length - 1];

        const angle0 = Math.atan2(last.y - first.y, last.x - first.x);

        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];

            if (Math.abs(point.y - first.y) + Math.abs(point.x - first.x) > thesholdDistance) {
                const angle = Math.atan2(point.y - first.y, point.x - first.x);
                if (Math.abs(angle0 - angle) > thesholdAngle)
                    return undefined;
            }

        }
        return { angle: angle0 };
    }

    serializeData(): ActionSerialized {
        return { type: "freedraw", pause: this.pause, userid: this.userid, points: this.points };
    }

    public alreadyDrawnSth = false;
    public points: { x: number; y: number; pressure: number; color: string; }[] = [];

    /**
     * 
     * @param pt 
     * @returns true if the point was indeed added
     */
    addPoint(pt: { x: number; y: number; pressure: number; color: string; }): boolean {
        pt.x = Geometry.numberRound(pt.x);
        pt.y = Geometry.numberRound(pt.y);

        if (this.points.length > 0) {
            const pointBefore = this.points[this.points.length - 1];
            if (Math.abs(pt.x - pointBefore.x) < 1 && Math.abs(pt.y - pointBefore.y) < 1)
            //if the point is too close, we will not add it
                return false;
        }

        this.points.push(pt);
        if (Math.abs(pt.x - this.points[0].x) > 1 || Math.abs(pt.y - this.points[0].y) > 1)
            this.alreadyDrawnSth = true;

        return true;
    }


    private smoothifyOnePass() {
        const newpoints: { x: number; y: number; pressure: number; color: string; }[] = [];

        newpoints.push(this.points[0]);
        for (let i = 0; i < this.points.length - 1; i++) {
            const a = this.points[i];
            const b = this.points[i + 1];

            if (Math.abs(a.x - b.x) > 5 || Math.abs(a.y - b.y) > 5) {
                newpoints.push({ x: Geometry.numberRound(0.85 * a.x + 0.15 * b.x), y: Geometry.numberRound(0.85 * a.y + 0.15 * b.y), pressure: b.pressure, color: a.color });
                newpoints.push({ x: Geometry.numberRound(0.15 * a.x + 0.85 * b.x), y: Geometry.numberRound(0.15 * a.y + 0.85 * b.y), pressure: b.pressure, color: a.color });
            }
            else
                newpoints.push(a);


        }

        newpoints.push(this.points[this.points.length - 1]);

        this.points = newpoints;
    }

    smoothify(): void {
        // console.log("before: " + this.points.length);
        this.smoothifyOnePass();
        //console.log("after: " + this.points.length);
        /*   this.smoothifyOnePass();
           this.smoothifyOnePass();
           this.smoothifyOnePass();*/
    }


    getMainColor(): string {
        return this.points[0].color;
    }


    async redo(): Promise<void> {
        if (!this.alreadyDrawnSth)
            Drawing.drawDot(this.points[0].x, this.points[0].y, this.points[0].color);

        for (let i = 1; i < this.points.length; i++) {
            Drawing.drawLine(getCanvas().getContext("2d"), this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
        }

    }

}