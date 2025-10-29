import katex from 'katex'

export function linspace(start, end, num) {
    return Array.from(
        { length: num },
        (_, i) => start + (end - start) * (i / (num - 1))
    )
}

export function meshgrid(arr1, arr2) {
    const w = arr1.length
    const h = arr2.length
    let grid = Array(h)
        .fill()
        .map(() =>
            Array(w)
                .fill()
                .map(() => [])
        )
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            grid[j][i] = [arr1[i], arr2[j]]
        }
    }
    return grid
}

export function renderKatex(text, element, x, y, angle = null) {
    const nodeName = element.node().nodeName.toLowerCase()
    if (nodeName !== 'foreignobject') {
        console.warn(
            'Expected a <foreignObject> element for KaTeX rendering, but got:',
            nodeName
        )
        return element
    }

    let div = element.select('div.katex-wrapper')
    if (div.empty()) {
        div = element
            .append('xhtml:div')
            .attr('class', 'katex-wrapper')
            .style('display', 'inline-block') // so width/height are tight
            .style('white-space', 'nowrap') // prevent line‑break shrink
    }

    div.html(katex.renderToString(text || '', { throwOnError: false }))

    // Measure after next paint so layout is final
    requestAnimationFrame(() => {
        const { width, height } = div.node().getBoundingClientRect()

        // Only set the dimensions afterwards, once the width and height are measured accurately
        element
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)

        if (angle) {
            element.attr('transform', `rotate(${angle}, ${x}, ${y})`)
        }
    })
    return element
}

export function getDataType(data, accessor = (d) => d) {
    if (!data) return 'unknown'

    for (let i = 0; i < data.length; i++) {
        const value = accessor(data[i])
        // console.log(data[i]);
        if (value !== undefined && value !== null) {
            if (typeof value === 'string') return 'string'
            if (value instanceof Date) return 'date'
            if (typeof value === 'number' && !isNaN(value)) return 'number'
        }
    }
    return 'unknown'
}

export function validateProps(props, requiredProps, chartName = 'Base Plot') {
    const missing = []

    for (const prop of requiredProps) {
        const value = props[prop]

        if (value === undefined || value === null) {
            missing.push(prop)
            continue
        }

        // Special validation for arrays that should not be empty
        if (prop === 'data' && Array.isArray(value) && value.length === 0) {
            missing.push(`${prop} (empty array)`)
            continue
        }

        // Special validation for string props that should not be empty
        if (typeof value === 'string' && value.trim() === '') {
            missing.push(`${prop} (empty string)`)
            continue
        }
    }

    if (missing.length > 0) {
        const chartType = chartName
        const message = `${chartType}: Missing or invalid required props: ${missing.join(', ')}`
        console.warn(message)
        return false
    }

    return true
}
