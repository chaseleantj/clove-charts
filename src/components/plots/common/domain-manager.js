import * as d3 from 'd3'
import styles from './page.module.css'
import { getDataType } from './utils'

class DomainManager {
    constructor(data) {
        this.data = data
    }

    getDomain(accessor, padding = 0) {
        if (getDataType(this.data, accessor) === 'string') {
            return [...new Set(this.data.map(accessor))]
        } else {
            return this.getNumericalDomain(accessor, padding)
        }
    }

    getNumericalDomain(accessor, padding = 0) {
        let min = d3.min(this.data, accessor)
        let max = d3.max(this.data, accessor)

        if (min === undefined || max === undefined) {
            min = 0
            max = 1
            console.warn('Unable to find data domain!')
        }

        if (getDataType(this.data, accessor) === 'date') {
            const diff = max.getTime() - min.getTime()
            return [
                new Date(min.getTime() - padding * diff),
                new Date(max.getTime() + padding * diff),
            ]
        }

        return this.padDomain([min, max], padding)
    }

    padDomain(domain, padding) {
        const min = domain[0]
        const max = domain[1]
        const diff = max - min
        return [min - padding * diff, max + padding * diff]
    }
}

export default DomainManager
