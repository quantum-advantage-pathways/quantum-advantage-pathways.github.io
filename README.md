# Quantum Advantage Pathways

This repository hosts the source code for the Quantum Advantage Pathways website, a resource for understanding the pathways to achieving quantum advantage.

## About the Project

The website provides a collection of resources and explanations on various topics related to quantum computing, including:

*   Observable Estimations
*   Variational Problems
*   Classically Verifiable Problems

## Viewing the Website

The website is hosted on GitHub Pages and can be accessed at:

[https://quantum-advantage-pathways.github.io/](https://quantum-advantage-pathways.github.io/)

## Running Locally

To run the website on your local machine, you can use a simple HTTP server. If you have Node.js installed, you can use the `serve` package:

```bash
npx serve
```

This will start a local server and provide you with a URL to view the website in your browser.

## Contributing

Contributions to the project are welcome. Please feel free to open an issue or submit a pull request.

### Tracker data workflow

Each pathway keeps its canonical data under `data/paths/<path-id>/`:

- `meta.json` captures pathway-specific copy and column headings.
- `problems/*.json` stores one file per benchmark instance together with links to its QASM and metadata (also mirrored under `problems/<path>/`).
- `submissions/*.json` stores one file per verified claim.

Run the helper script whenever problems or submissions change:

```bash
python3 scripts/build_trackers.py
```

It regenerates the aggregated `problems.json` and `submissions.json` files consumed by the front-end. The `Validate tracker data` GitHub Action runs this script on every PR touching the tracker folders and fails if the generated artifacts are missing from the diff.

## License

This project is licensed under the Apache-2.0 license - see the [LICENSE](LICENSE) file for details.
