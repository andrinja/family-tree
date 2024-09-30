'use client';
import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {sugiyama, graphStratify} from 'd3-dag';
import {Database} from '@/database.types';

type Props = {
	data: Database['public']['Tables']['persons']['Row'][];
};

const createDagData = (data: Props['data']) => {
	// Create nodes with 'id', 'name', and 'parentIds' properties
	const nodes = data.map((person) => ({
		id: person.id.toString(),
		name: `${person.first_name} ${person.last_name}`,
		parentIds: [person.mother_id, person.father_id]
			.filter(Boolean)
			.map((id) => id?.toString() || ''),
	}));

	return nodes;
};

const FamilyTree = ({data}: Props) => {
	const svgRef = useRef<SVGSVGElement>(null);

	const nodes = createDagData(data);

	useEffect(() => {
		// Clear any existing content in the SVG
		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove(); // Clear existing content

		// Create a DAG from the nodes using graphStratify
		const stratify = graphStratify();

		const dag = stratify(nodes);

		const nodeWidth = 150;
		const nodeHeight = 60;
		const xGap = 100;
		const yGap = 100;

		// Apply the sugiyama layout to the DAG
		sugiyama().nodeSize([nodeWidth, nodeHeight]).gap([xGap, yGap])(dag);

		const g = svg.append('g');

		// Render the nodes
		const nodeSelection = g
			.selectAll('g.node')
			.data(dag.nodes())
			.enter()
			.append('g')
			.attr('class', 'node')
			.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

		nodeSelection
			.append('rect')
			.attr('width', nodeWidth)
			.attr('height', nodeHeight)
			.attr('x', -nodeWidth / 2)
			.attr('y', -nodeHeight / 2)
			.attr('fill', 'lightblue');

		nodeSelection
			.append('text')
			.text((d) => d.data.name)
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle');

		// Render the links
		g.selectAll('path.link')
			.data(dag.links())
			.enter()
			.append('path')
			.attr('class', 'link')
			.attr('d', (d) => {
				const line = d3.line().curve(d3.curveLinear);
				return line([
					[d.source.x, d.source.y + nodeHeight / 2], // Bottom of source rectangle
					[d.target.x, d.target.y - nodeHeight / 2], // Top of target rectangle
				]);
			})
			.attr('fill', 'none')
			.attr('stroke', 'white');

		const zoomBehavior = d3
			.zoom()
			.scaleExtent([0.1, 10]) // Set the minimum and maximum zoom scale
			.on('zoom', (event) => {
				g.attr('transform', event.transform);
			});

		svg.call(zoomBehavior);

		const gNode = g.node();

		if (gNode) {
			const {x, y, width, height} = gNode.getBBox() as DOMRect;

			// Get the dimensions of the SVG
			const svgWidth = parseInt(svg.attr('width'));
			const svgHeight = parseInt(svg.attr('height'));

			// Calculate scale and translation to fit the graph within the SVG
			const scale = Math.min(svgWidth / (width + xGap * 2), svgHeight / (height + yGap * 2));
			const translateX = (svgWidth - scale * (width + x * 2)) / 2;
			const translateY = (svgHeight - scale * (height + y * 2)) / 2;

			// Apply initial transform to fit the graph
			const initialTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

			svg.call(zoomBehavior.transform, initialTransform);
		}
	}, [nodes]);

	return <svg ref={svgRef} width={1200} height={800} />;
};

export default FamilyTree;
