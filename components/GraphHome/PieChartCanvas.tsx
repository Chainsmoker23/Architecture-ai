import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { PieChartData } from '../../types';

interface PieChartCanvasProps {
  data: PieChartData;
  forwardedRef: React.RefObject<SVGSVGElement>;
}

const PieChartCanvas: React.FC<PieChartCanvasProps> = ({ data, forwardedRef }) => {
  const { slices } = data;

  useEffect(() => {
    if (!forwardedRef.current || !slices) return;

    const svg = d3.select(forwardedRef.current);
    svg.selectAll("*").remove();

    const { width, height } = svg.node()!.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const radius = Math.min(width, height) / 4;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<typeof slices[0]>()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc<d3.PieArcDatum<typeof slices[0]>>()
      .outerRadius(radius)
      .innerRadius(0);
      
    const outerArc = d3.arc<d3.PieArcDatum<typeof slices[0]>>()
        .innerRadius(radius * 1.2)
        .outerRadius(radius * 1.2);

    const data_ready = pie(slices);
    
    g.selectAll('.slice')
      .data(data_ready)
      .join('path')
      .attr('class', 'slice')
      .attr('fill', d => d.data.color)
      .attr('stroke', 'var(--color-canvas-bg)')
      .attr('stroke-width', 3)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attrTween('d', function (d) {
          const i = d3.interpolate(d.startAngle, d.endAngle);
          return function (t) {
              d.endAngle = i(t);
              return arc(d) || '';
          };
      });

    const LABEL_VERTICAL_PADDING = 38; 
    const labelData = data_ready.map(d => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return { ...d, midangle, initialY: pos[1], finalY: pos[1], pos };
    });

    const rightSide = labelData.filter(d => d.midangle < Math.PI).sort((a, b) => a.initialY - b.initialY);
    const leftSide = labelData.filter(d => d.midangle >= Math.PI).sort((a, b) => a.initialY - b.initialY);

    let lastY_right = -Infinity;
    rightSide.forEach(d => {
        d.finalY = Math.max(d.initialY, lastY_right + LABEL_VERTICAL_PADDING);
        lastY_right = d.finalY;
    });

    let lastY_left = -Infinity;
    leftSide.forEach(d => {
        d.finalY = Math.max(d.initialY, lastY_left + LABEL_VERTICAL_PADDING);
        lastY_left = d.finalY;
    });
      
    g.selectAll('.label-line')
      .data(labelData)
      .join('polyline')
      .attr('class', 'label-line')
      .attr('stroke', 'var(--color-text-secondary)')
      .style('fill', 'none')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .attr('points', d => {
          const posA = arc.centroid(d);
          const posB = outerArc.centroid(d);
          posB[1] = d.finalY;
          const posC = [...posB];
          posC[0] = radius * 1.4 * (d.midangle < Math.PI ? 1 : -1);
          return [posA, posB, posC].join(',');
      })
      .transition()
      .duration(500)
      .delay(800)
      .style('opacity', 1);

    g.selectAll('.label-text')
      .data(labelData)
      .join('text')
      .attr('class', 'label-text')
      .attr('dy', '.35em')
      .style('opacity', 0)
      .html(d => `<tspan>${d.data.label}:</tspan><tspan x="0" dy="1.2em" font-weight="bold">${d.data.value}%</tspan>`)
      .attr('transform', d => {
          const pos = [...d.pos];
          pos[0] = radius * 1.45 * (d.midangle < Math.PI ? 1 : -1);
          pos[1] = d.finalY;
          return `translate(${pos})`;
      })
      .style('text-anchor', d => (d.midangle < Math.PI ? 'start' : 'end'))
      .attr('fill', 'var(--color-text-primary)')
      .style('font-size', '14px')
      .transition()
      .duration(500)
      .delay(800)
      .style('opacity', 1);

  }, [data, forwardedRef]);

  return (
    <svg ref={forwardedRef} className="w-full h-full" style={{ overflow: 'visible' }}></svg>
  );
};

export default PieChartCanvas;