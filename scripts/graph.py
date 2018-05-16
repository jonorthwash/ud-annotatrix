import matplotlib.pyplot as plt
import networkx as nx

import os
import sys

def plot_graph(G):
    sys.stderr.write('graph.py: plotting graph\n')
    sys.stderr.flush()

    options = {
        'node_color': 'red',
        'node_size': 100,
        'width': 1,
        'with_labels': True,
    }
    nx.draw(G, **options)
    plt.show()

def build_graph():
    sys.stderr.write('graph.py: building NetworkX directed graph\n')
    sys.stderr.flush()

    graph_text_file = '/tmp/graph.txt'

    nodes = []
    edges = []

    with open(graph_text_file, 'r') as f:
        for line in f.readlines():
            line = line.strip()
            if line[0] == '+':
                target = line[1:]
                edges.append((source, target))
            else:
                source = line
                nodes.append(source)

    G = nx.DiGraph()
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)

    return G

if __name__ == '__main__':
    G = build_graph()
    plot_graph(G)
