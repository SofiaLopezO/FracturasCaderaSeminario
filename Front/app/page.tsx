"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Activity, Info, TrendingUp, BarChart3, PieChart } from "lucide-react"
import * as echarts from "echarts"
import styles from "@/styles/page.module.css"

type MonthRow = { mes: string; total: number }
type YearSeries = Record<number, MonthRow[]>
type DashboardResponse = {
  years: number[]
  series: YearSeries
  totalsByYear?: Record<number, number>
  distribution?: { name: string; raw?: string; value: number }[]
  updatedAt?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1"
const DASHBOARD_ENDPOINT = `${API_BASE}/public/dashboard`

const THEME_COLORS = {
  primary: "#3b82f6", 
  secondary: "#10b981", 
  accent: "#8b5cf6", 
  warning: "#f59e0b", 
  success: "#22c55e", 
  gradient: ["#3b82f6", "#1d4ed8", "#1e40af"],
  chartColors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"],
}

export default function Root() {
  const [stats, setStats] = useState<DashboardResponse | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const lineChartRef = useRef<HTMLDivElement>(null)
  const pieChartRef = useRef<HTMLDivElement>(null)
  const lineChartInstance = useRef<echarts.ECharts | null>(null)
  const pieChartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(DASHBOARD_ENDPOINT, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Respuesta inesperada (${response.status})`)
        }
        const payload = (await response.json()) as DashboardResponse
        setStats(payload)
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("dashboard fetch error", err)
        setError("No pudimos cargar los datos en este momento.")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!stats?.years?.length) return
    setYear((prev) => (stats.years.includes(prev) ? prev : stats.years[stats.years.length - 1]))
  }, [stats])

  const years = stats?.years?.length ? stats.years : [year]
  const uniqueYears = useMemo(() => Array.from(new Set(years)).sort((a, b) => a - b), [years])

  const selectedYear = useMemo(() => {
    if (stats?.years?.includes(year)) return year
    return stats?.years?.length ? stats.years[stats.years.length - 1] : year
  }, [stats, year])

  const data = useMemo<MonthRow[]>(() => {
    if (stats?.series && stats.series[selectedYear]) {
      return stats.series[selectedYear]
    }
    return []
  }, [stats, selectedYear])

  const totalAnual = useMemo(() => {
    if (stats?.totalsByYear?.[selectedYear] != null) {
      return stats.totalsByYear[selectedYear] ?? 0
    }
    return data.reduce((a, r) => a + r.total, 0)
  }, [stats, selectedYear, data])

  const distribution = stats?.distribution ?? []

  useEffect(() => {
    if (!lineChartRef.current || loading || !data.length) return

    if (lineChartInstance.current) {
      lineChartInstance.current.dispose()
    }

    const chart = echarts.init(lineChartRef.current, "light")
    lineChartInstance.current = chart

    const option = {
      backgroundColor: "transparent",
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: THEME_COLORS.primary,
        borderWidth: 1,
        textStyle: {
          color: "#1e293b",
          fontSize: 12,
        },
        formatter: (params: any) => {
          const point = params[0]
          return `
            <div style="padding: 8px;">
              <div style="color: ${THEME_COLORS.primary}; font-weight: bold; margin-bottom: 4px;">
                ${point.name}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; background: ${THEME_COLORS.primary}; border-radius: 50%;"></div>
                <span>Pacientes: <strong>${point.value}</strong></span>
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.mes),
        axisLine: {
          lineStyle: {
            color: "#e2e8f0",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: "#f1f5f9",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "Pacientes",
          type: "line",
          data: data.map((d) => d.total),
          smooth: true,
          lineStyle: {
            color: THEME_COLORS.primary,
            width: 3,
            shadowColor: THEME_COLORS.primary,
            shadowBlur: 10,
            shadowOffsetY: 2,
          },
          itemStyle: {
            color: THEME_COLORS.primary,
            borderColor: "#fff",
            borderWidth: 2,
            shadowColor: THEME_COLORS.primary,
            shadowBlur: 8,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${THEME_COLORS.primary}40` },
                { offset: 1, color: `${THEME_COLORS.primary}10` },
              ],
            },
          },
          emphasis: {
            focus: "series",
            itemStyle: {
              color: THEME_COLORS.primary,
              borderColor: "#fff",
              borderWidth: 3,
              shadowColor: THEME_COLORS.primary,
              shadowBlur: 15,
            },
          },
          animationDuration: 2000,
          animationEasing: "cubicOut",
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.dispose()
    }
  }, [data, loading])

  useEffect(() => {
    if (!pieChartRef.current || loading || !distribution.length) return

    if (pieChartInstance.current) {
      pieChartInstance.current.dispose()
    }

    const chart = echarts.init(pieChartRef.current, "light")
    pieChartInstance.current = chart

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: THEME_COLORS.primary,
        borderWidth: 1,
        textStyle: {
          color: "#1e293b",
          fontSize: 12,
        },
        formatter: (params: any) => `
            <div style="padding: 8px;">
              <div style="color: ${params.color}; font-weight: bold; margin-bottom: 4px;">
                ${params.name}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; background: ${params.color}; border-radius: 50%;"></div>
                <span>Casos: <strong>${params.value}</strong> (${params.percent}%)</span>
              </div>
            </div>
          `,
      },
      legend: {
        orient: "horizontal",
        bottom: "5%",
        textStyle: {
          color: "#64748b",
          fontSize: 11,
        },
        itemGap: 20,
      },
      series: [
        {
          name: "Distribución",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "45%"],
          data: distribution.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: THEME_COLORS.chartColors[index % THEME_COLORS.chartColors.length],
              borderColor: "#ffffff",
              borderWidth: 2,
              shadowColor: "rgba(0, 0, 0, 0.1)",
              shadowBlur: 10,
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.2)",
              scale: true,
              scaleSize: 5,
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              color: "#1e293b",
            },
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{d}%",
            fontSize: 11,
            color: "#64748b",
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: "#cbd5e1",
            },
          },
          animationType: "scale",
          animationEasing: "elasticOut",
          animationDuration: (idx: number) => Math.random() * 1000 + 1000,
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.dispose()
    }
  }, [distribution, loading])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <motion.div
            className={styles.logo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.logoIcon} />
            <span className={styles.logoText}>Fracturas de Cadera</span>
          </motion.div>
          <nav>
            <Link href="/login" className={styles.loginButton}>
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleGradient}>Bienvenido/a</span>
            </h1>
            <p className={styles.heroDescription}>
              Panel profesional con análisis avanzado del registro institucional de fracturas de cadera
            </p>
          </motion.div>
        </div>

        <div className={styles.yearSelector}>
          <div className={styles.yearButtons}>
            {uniqueYears.map((y, index) => (
              <motion.button
                key={y}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setYear(y)}
                className={`${styles.yearButton} ${selectedYear === y ? styles.yearButtonActive : ""}`}
                disabled={loading}
              >
                {y}
              </motion.button>
            ))}
          </div>
          <div className={styles.statusInfo}>
            {loading && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>Cargando datos...</span>
              </div>
            )}
            {!loading && error && <div className={styles.error}>{error}</div>}
            {!loading && !error && stats?.updatedAt && (
              <span>
                Última actualización:{" "}
                {new Date(stats.updatedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            {!loading && !error && !stats?.updatedAt && stats && <span className={styles.success}>Datos en línea</span>}
            {!loading && !error && !stats && <span className={styles.warning}>No hay registros disponibles.</span>}
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.grid}>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${styles.chartCard} ${styles.chartCardLarge}`}
          >
            <div className={styles.chartHeader}>
              <div className={`${styles.chartIcon} ${styles.chartIconBlue}`}>
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <h2 className={styles.chartTitle}>{totalAnual.toLocaleString()} pacientes</h2>
                <p className={styles.chartSubtitle}>registrados en {selectedYear}</p>
              </div>
            </div>

            <div className={styles.chartContainer}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingContent}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando serie temporal...</p>
                  </div>
                </div>
              ) : data.length ? (
                <div ref={lineChartRef} className={styles.chartContainer} />
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateContent}>
                    <BarChart3 className={styles.emptyStateIcon} />
                    <p>Sin registros para {selectedYear}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${styles.chartCard} ${styles.chartCardSmall}`}
          >
            <div className={styles.chartHeader}>
              <div className={`${styles.chartIcon} ${styles.chartIconGreen}`}>
                <PieChart className="h-7 w-7" />
              </div>
              <div>
                <h2 className={styles.chartTitle}>Distribución por tipo</h2>
                <p className={styles.chartSubtitle}>de fractura</p>
              </div>
            </div>

            <div className={styles.chartContainer}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingContent}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Preparando distribución...</p>
                  </div>
                </div>
              ) : distribution.length ? (
                <div ref={pieChartRef} className={styles.chartContainer} />
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateContent}>
                    <Activity className={styles.emptyStateIcon} />
                    <p>Sin datos de distribución</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={styles.infoSection}
        >
          <div className={styles.infoHeader}>
            <div className={styles.infoIcon}>
              <Info className="h-7 w-7" />
            </div>
            <h3 className={styles.infoTitle}>Panorama de las fracturas de cadera</h3>
          </div>

          <div className={styles.statsGrid}>
            <Stat
              value="1.6 millones"
              headline="Casos por año en el mundo"
              context="Carga anual estimada actualmente."
              href="https://fundaciontrauma.org.ar/pasos/#estructura-colaborativa"
            />
            <Stat
              value="6.3 millones"
              headline="Casos anuales proyectados al 2050"
              context="≈4× por envejecimiento poblacional."
              href="https://fundaciontrauma.org.ar/pasos/#estructura-colaborativa"
            />
            <Stat
              value="30%"
              headline="Mayores de Chile con 80+ años en 2050"
              context="Proyección demográfica nacional."
              href="https://www.uc.cl/noticias/observatorio-del-envejecimiento-chile-tendra-a-3-de-cada-10-personas-por-sobre-los-80-anos-en-2050/"
            />
          </div>

          <div className={styles.expandableContent}>
            <p className={styles.expandableText}>
              El envejecimiento acelerado incrementa la demanda de atención geriátrica, rehabilitación y{" "}
              <span style={{ fontWeight: 600, color: "#10b981" }}>prevención secundaria</span>. Las fracturas de cadera
              representan un desafío creciente para los sistemas de salud, requiriendo estrategias integrales.
            </p>

            <button onClick={() => setExpanded((v) => !v)} className={styles.expandButton}>
              {expanded ? "Leer menos" : "Leer más"}
              <svg
                className={`${styles.expandIcon} ${expanded ? styles.expandIconRotated : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className={styles.expandedContent}
              >
                <p className={styles.expandedText}>
                  Esta plataforma centraliza datos clínicos para análisis por cohorte o paciente, mejora la trazabilidad
                  y habilita decisiones basadas en evidencia. Ofrece acceso segmentado y métricas clave para
                  profesionales de salud y gestores, facilitando la investigación y el seguimiento de outcomes clínicos.
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            <p className={styles.footerMainText}>
              © {new Date().getFullYear()} Registro de Fracturas de Cadera — Hospital.
            </p>
            <p className={styles.footerSubText}>Plataforma de análisis clínico y seguimiento epidemiológico</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({
  value,
  headline,
  context,
  href,
}: {
  readonly value: string
  readonly headline: string
  readonly context?: string
  readonly href?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={styles.statCard}
    >
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statHeadline}>{headline}</div>
      {context && <div className={styles.statContext}>{context}</div>}
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className={styles.statLink}>
          <span>Fuente</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </motion.div>
  )
}
