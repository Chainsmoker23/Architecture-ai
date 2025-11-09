import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { PieChartData } from '../../types';

interface PieChartCanvasProps {
  data: PieChartData;
}

const PieChartCanvas: React.FC<PieChartCanvasProps> = ({ data }) => {
  const ref = useRef<SVGSVGElement>(null);
  const { title, slices } = data;

  useEffect(() => {
    if (!ref.current || !slices) return;

    const svg = d3.select(ref.current);
    const width = svg.node()!.getBoundingClientRect().width;
    const height = svg.node()!.getBoundingClientRect().height;
    const radius = Math.min(width, height) / 2.5;

    const g = svg.select<SVGGElement>(".pie-container")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof slices[0]>()
      .sort(null)
      .value(d => d.value);

    const path = d3.arc<d3.PieArcDatum<typeof slices[0]>>()
      .outerRadius(radius)
      .innerRadius(0);
      
    const labelArc = d3.arc<d3.PieArcDatum<typeof slices[0]>>()
        .outerRadius(radius * 1.15)
        .innerRadius(radius * 1.15);

    const data_ready = pie(slices);
    
    // Animate slices with framer-motion in the JSX return

    // Add labels
    g.selectAll('.label-line').remove();
    g.selectAll('.label-text').remove();

    const labels = g.selectAll('.label-text')
      .data(data_ready)
      .join('text')
      .attr('class', 'label-text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', d => {
          const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return (midangle < Math.PI ? 'start' : 'end');
      })
      .attr('fill', 'var(--color-text-primary)')
      .style('opacity', 0)
      .text(d => `${d.data.label}: ${d.data.value}%`)
      .transition()
      .duration(500)
      .delay(800)
      .style('opacity', 1);

  }, [slices, ref]);

  const pie = d3.pie<typeof slices[0]>().sort(null).value(d => d.value);
  const data_ready = pie(slices);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <svg ref={ref} className="flex-1 w-full">
        <g className="pie-container">
          {data_ready.map((d, i) => {
            const arcGenerator = d3.arc<d3.PieArcDatum<typeof slices[0]>>()
              .innerRadius(0)
              .outerRadius(Math.min(300, 400) / 2 * 0.8);
              
            return (
              <motion.path
                key={d.data.label}
                d={arcGenerator(d) || ''}
                fill={d.data.color}
                stroke="var(--color-canvas-bg)"
                strokeWidth={3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default PieChartCanvas;
