<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<p align="center">
  <a href="https://github.com/ssebastian-diazz/G20-Macro-Analysis/issues"><img src="https://img.shields.io/github/issues/ssebastian-diazz/G20-Macro-Analysis.svg?style=for-the-badge" alt="Issues"></a>
  <a href="https://github.com/ssebastian-diazz/G20-Macro-Analysis/blob/main/LICENSE.txt"><img src="https://img.shields.io/badge/license-Unlicense-black.svg?style=for-the-badge" alt="License"></a>
  <a href="https://www.linkedin.com/in/sebasti%C3%A1n-d%C3%ADaz-prado-0780731bb/"><img src="https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555" alt="LinkedIn"></a>
</p>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">G20 Macro Dashboard</h3>

  <p align="center">
    A comparative dashboard for macroeconomic, external, and institutional indicators across the G20 economies
    <br />
    <a href="#about-the-project"><strong>Explore the analysis »</strong></a>
    <br />
    <br />
    <a href="https://ssebastian-diazz.github.io/G20-Macro-Analysis/">View Demo</a>
    &middot;
    <a href="https://github.com/ssebastian-diazz/G20-Macro-Analysis/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/ssebastian-diazz/G20-Macro-Analysis/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#data--methodology">Data &amp; Methodology</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Comparing G20 economies usually means jumping between IMF, World Bank, and BIS spreadsheets, each with its own coverage and formatting. This project consolidates that into a single dashboard covering 19 G20 countries across 6 categories — External, Financial, Fiscal, Institutional, Monetary, and Real — so a cross-country comparison or a single-country deep dive is a few clicks away instead of a data-wrangling exercise.

The dashboard has four views:

- **Compare** — rank every G20 economy on a single indicator, sortable and filterable by category and year.
- **Country** — a full profile for one economy across all tracked indicators.
- **Relations** — cross-indicator relationships between economies.
- **Vulnerabilities** — a heatmap-style view flagging where individual economies look most exposed.

The underlying dataset covers 42 indicators and 19 countries (1,482 observations total), built from a structured Excel workbook and validated for missing/flagged values before publication.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Python][Python]][Python-url]
* [![JavaScript][JavaScript]][JavaScript-url]
* [![Plotly][Plotly]][Plotly-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

The project has two parts: a Python pipeline that cleans the source workbook into the JSON files the dashboard reads, and a static explorer (HTML/CSS/JS + Plotly.js) that visualizes them.

### Prerequisites

Any local static file server. For example, Python's built-in one:
```sh
python3 -m http.server
```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ssebastian-diazz/G20-Macro-Analysis.git
   ```
2. Move into the project directory
   ```sh
   cd G20-Macro-Analysis
   ```
3. Serve it locally
   ```sh
   python3 -m http.server
   ```
4. Open `http://localhost:8000` in your browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

- Switch between **Compare**, **Country**, **Relations**, and **Vulnerabilities** using the tab bar.
- In **Compare**, pick a category and indicator to rank every G20 economy for a given year.
- In **Country**, select an economy to see its full indicator profile in one place.
- In **Vulnerabilities**, scan the heatmap for economies flagged across multiple risk dimensions at once.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DATA & METHODOLOGY -->
## Data & Methodology

Source data is compiled from a structured macroeconomic workbook (`d.xlsx`) covering the G20 economies, spanning six categories: External, Financial, Fiscal, Institutional, Monetary, and Real. The build pipeline cleans and reshapes the workbook into `g20_long.json`, `country_profiles.json`, `indicators_catalog.json`, and `vulnerability_scores.json`, and validates the result — `quality_report.json` tracks missing, flagged, and estimated values by sheet and category so they can be reviewed before publication.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Automate the workbook-to-JSON pipeline as a scheduled job
- [ ] Add a year-over-year trend view per indicator
- [ ] Resolve the remaining flagged/estimated observations against source data

See the [open issues](https://github.com/ssebastian-diazz/G20-Macro-Analysis/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Sebastián Díaz Prado — [sebastiaan.diaz.prado@gmail.com](mailto:sebastiaan.diaz.prado@gmail.com) — [LinkedIn](https://www.linkedin.com/in/sebasti%C3%A1n-d%C3%ADaz-prado-0780731bb/)

Project Link: [https://github.com/ssebastian-diazz/G20-Macro-Analysis](https://github.com/ssebastian-diazz/G20-Macro-Analysis)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Python]: https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[JavaScript]: https://img.shields.io/badge/javascript-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[Plotly]: https://img.shields.io/badge/plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white
[Plotly-url]: https://plotly.com/javascript/
