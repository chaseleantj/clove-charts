import * as d3 from 'd3'
import { useRef, useState, useCallback, useMemo } from 'react'
import BaseScatterPlot from '@/app/components/plots/templates/scatter-plot'

import { Dropdown, CSVUpload, InputGroup } from '@/app/components/inputs/inputs'
import { getDataType } from '@/app/components/plots/common/utils'
import styles from '@/app/components/plots/common/page.module.css'

const PLOT_CONFIG = {
    themeConfig: { enableZoom: true },
    absolutePositions: { top: '0%', right: '0%' },
    margin: { right: 60, left: 60 },
}

const NUMERICAL_DATA_TYPES = ['number', 'date']

export default function CustomScatterChart() {
    const tooltipRef = useRef(null)
    const legendRef = useRef(null)

    const [csvData, setCsvData] = useState([])
    const [columns, setColumns] = useState([])
    const [numericalColumns, setNumericalColumns] = useState([])
    const [selectedXColumn, setSelectedXColumn] = useState(null)
    const [selectedYColumn, setSelectedYColumn] = useState(null)
    const [selectedColorColumn, setSelectedColorColumn] = useState(null)

    const legendConfig = useMemo(
        () => ({ legendRef, absolutePositions: PLOT_CONFIG.absolutePositions }),
        []
    )
    const tooltipConfig = useMemo(() => ({ tooltipRef }), [])

    const handleCsvUpload = useCallback((data) => {
        setSelectedXColumn(null)
        setSelectedYColumn(null)
        setSelectedColorColumn(null)

        setCsvData(data)
        setColumns(data.columns)

        const newNumericalColumns = data.columns.filter((col) =>
            NUMERICAL_DATA_TYPES.includes(getDataType(data, (d) => d[col]))
        )
        setNumericalColumns(newNumericalColumns)
    }, [])

    const numColumnsOptions = useMemo(
        () => [
            { label: 'None', value: null },
            ...numericalColumns.map((x) => ({ label: x, value: x })),
        ],
        [numericalColumns]
    )

    const columnsOptions = useMemo(
        () => [
            { label: 'None', value: null },
            ...columns.map((x) => ({ label: x, value: x })),
        ],
        [columns]
    )

    return (
        <div className={styles.chart}>
            <CSVUpload
                labelElement="Upload a CSV file"
                handleInput={handleCsvUpload}
            />
            {numericalColumns.length > 0 && (
                <InputGroup>
                    <Dropdown
                        options={numColumnsOptions}
                        value={selectedXColumn}
                        labelElement="x-axis"
                        handleInput={setSelectedXColumn}
                    />
                    <Dropdown
                        options={numColumnsOptions}
                        value={selectedYColumn}
                        labelElement="y-axis"
                        handleInput={setSelectedYColumn}
                    />
                    <Dropdown
                        options={columnsOptions}
                        value={selectedColorColumn}
                        labelElement="color by"
                        handleInput={setSelectedColorColumn}
                    />
                </InputGroup>
            )}
            {csvData.length > 0 && (
                <>
                    <div className={styles.plotWrapper}>
                        <div className={styles.plot}>
                            <div
                                ref={legendRef}
                                className={styles.legend}
                            ></div>
                            <div
                                ref={tooltipRef}
                                className={styles.tooltip}
                            ></div>
                            <BaseScatterPlot
                                data={csvData}
                                xClass={selectedXColumn}
                                yClass={selectedYColumn}
                                colorByClass={selectedColorColumn}
                                legendConfig={legendConfig}
                                tooltipConfig={tooltipConfig}
                                themeConfig={PLOT_CONFIG.themeConfig}
                                margin={PLOT_CONFIG.margin}
                            />
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <div className={styles.captions}>
                            <p>
                                Here is a scatter plot of the uploaded dataset.
                                Hover over the points for more info.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
