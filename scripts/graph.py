import matplotlib.pyplot as plt
import networkx as nx

import os
import re

def plot_graph(G):
    print('Plotting graph')
    options = {
        'node_color': 'black',
        'node_size': 100,
        'width': 3
    }
    nx.draw(G, **options)
    plt.show()

def build_graph():
    print('Building NetworkX directed graph')
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
    print(G.nodes)
    plot_graph(G)
