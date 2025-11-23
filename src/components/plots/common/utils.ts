import katex from 'katex';
import * as d3 from 'd3';

export function renderKatex(
    text: string,
    element:
        | d3.Selection<SVGForeignObjectElement, unknown, null, undefined>
        | d3.Transition<SVGForeignObjectElement, unknown, null, undefined>,
    x: number,
    y: number,
    angle?: number
):
    | d3.Selection<SVGForeignObjectElement, unknown, null, undefined>
    | d3.Transition<SVGForeignObjectElement, unknown, null, undefined> {
    if (!element) return element;

    const selection =
        'selection' in element
            ? (
                  element as d3.Transition<
                      SVGForeignObjectElement,
                      unknown,
                      null,
                      undefined
                  >
              ).selection()
            : (element as d3.Selection<
                  SVGForeignObjectElement,
                  unknown,
                  null,
                  undefined
              >);

    const nodeName = selection.node()?.nodeName.toLowerCase() ?? 'unknown';

    if (nodeName !== 'foreignobject') {
        console.warn(
            'Expected a <foreignObject> element for KaTeX rendering, but got:',
            nodeName
        );
        return element;
    }

    // Set coordinates and transform immediately to support transitions
    (element as any).attr('x', x).attr('y', y);

    if (angle) {
        (element as any).attr('transform', `rotate(${angle}, ${x}, ${y})`);
    } else {
        // Optional: Remove transform if no angle, or reset it.
        // Adhering to previous behavior of only setting if angle exists.
        // But if animating from angle to 0, we might need to handle it.
        // For now, sticking to previous logic which only set if angle is truthy.
        // If the user sets angle to 0, it might not clear a previous rotation.
        // However, existing code checked `if (angle)`.
        if (angle === 0) {
             (element as any).attr('transform', null);
        }
    }

    let div = selection.select('div.katex-wrapper');
    if (div.empty()) {
        div = selection
            .append('xhtml:div')
            .attr('class', 'katex-wrapper')
            .style('display', 'inline-block') // so width/height are tight
            .style('white-space', 'nowrap'); // prevent line‑break shrink
    }

    div.html(katex.renderToString(text || '', { throwOnError: false }));

    // Measure after next paint so layout is final
    requestAnimationFrame(() => {
        const { width, height } = (
            div.node() as Element
        )?.getBoundingClientRect() ?? { width: 0, height: 0 };

        // Only set the dimensions afterwards, once the width and height are measured accurately
        // Use selection to set width/height instantly (snap)
        selection
            .attr('width', width)
            .attr('height', height);
    });
    return element;
}
