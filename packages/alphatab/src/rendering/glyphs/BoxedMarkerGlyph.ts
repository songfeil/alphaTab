import type { Font } from '@coderline/alphatab/model/Font';
import type { Color } from '@coderline/alphatab/model/Color';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

/**
 * Renders a section marker with a rectangular box around the marker label
 * (e.g. |A| Verse), mimicking Guitar Pro's visual style instead of AlphaTab's
 * default "[A] Verse" bracket notation.
 * @internal
 */
export class BoxedMarkerGlyph extends EffectGlyph {
    private static readonly BoxPaddingX = 4;
    private static readonly BoxPaddingY = 4;
    private static readonly Gap = 5;

    private _marker: string;
    private _text: string;
    private _markerWidth: number = 0;
    private _markerHeight: number = 0;

    public font: Font;
    public textAlign: TextAlign;
    public colorOverride?: Color;

    public constructor(
        x: number,
        y: number,
        marker: string,
        text: string,
        font: Font,
        textAlign: TextAlign = TextAlign.Left,
        color?: Color
    ) {
        super(x, y);
        this._marker = marker;
        this._text = text;
        this.font = font;
        this.textAlign = textAlign;
        this.colorOverride = color;
    }

    public override doLayout(): void {
        super.doLayout();

        const canvas = this.renderer.scoreRenderer.canvas!;
        canvas.font = this.font;

        const markerSize = canvas.measureText(this._marker);
        this._markerWidth = markerSize.width;
        this._markerHeight = markerSize.height;

        const px = BoxedMarkerGlyph.BoxPaddingX;
        const py = BoxedMarkerGlyph.BoxPaddingY;
        const boxW = this._markerWidth + 2 * px;
        const boxH = this._markerHeight + 2 * py;

        this.height = boxH;
        this.width = boxW;

        if (this._text) {
            const textSize = canvas.measureText(this._text);
            this.width = boxW + BoxedMarkerGlyph.Gap + textSize.width;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const color = canvas.color;
        canvas.color = this.colorOverride ?? color;
        canvas.font = this.font;

        const oldAlign = canvas.textAlign;
        const oldBaseline = canvas.textBaseline;
        canvas.textAlign = this.textAlign;

        const px = BoxedMarkerGlyph.BoxPaddingX;
        const py = BoxedMarkerGlyph.BoxPaddingY;
        const boxW = this._markerWidth + 2 * px;
        const boxH = this._markerHeight + 2 * py;

        // Draw box around marker label
        const oldLineWidth = canvas.lineWidth;
        canvas.lineWidth = 1.5;
        canvas.strokeRect(cx + this.x, cy + this.y, boxW, boxH);
        canvas.lineWidth = oldLineWidth;

        // Draw marker text centered in the box
        canvas.textBaseline = TextBaseline.Middle;
        canvas.fillText(this._marker, cx + this.x + px, cy + this.y + boxH / 2);

        // Draw section text after the box
        if (this._text) {
            canvas.fillText(this._text, cx + this.x + boxW + BoxedMarkerGlyph.Gap, cy + this.y + boxH / 2);
        }

        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseline;
        canvas.color = color;
    }
}
