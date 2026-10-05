# -*- coding: utf-8 -*-
"""
Script gerador da documentação unificada em PDF do PAM Fitness.
Compila todo o conteúdo de README.md, SENSORES.md, FUNCOES_REACT.md e GUIA_DE_CHAMADAS.md
com estrutura de árvore, tabelas técnicas, diagramas visuais, equações formatadas
e marcadores nativos de PDF (Bookmarks / TOC).
"""

import os
import subprocess
import pymupdf

def build_html() -> str:
    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>PAM Fitness — Documentação Completa e Especificação Técnica</title>
<style>
  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 12.5px;
    margin: 0;
    padding: 0;
  }

  /* REGRAS DE QUEBRA DE PÁGINA */
  .page {
    page-break-after: always;
    break-after: page;
    min-height: 255mm;
    position: relative;
  }
  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }
  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* CAPA ELEGANTE E MODERNA */
  .cover-page {
    min-height: 258mm;
    background: linear-gradient(145deg, #09090b 0%, #111116 55%, #18181f 100%);
    color: #ffffff;
    padding: 30mm 18mm 18mm 18mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    page-break-after: always;
    border-radius: 4px;
    overflow: hidden;
  }

  .cover-page::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #ccff00, #38bdf8, #818cf8);
  }

  .cover-badge-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }

  .cover-badge {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e2e8f0;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .cover-badge.neon {
    background: rgba(204, 255, 0, 0.12);
    border-color: #ccff00;
    color: #ccff00;
  }

  .cover-badge.cyan {
    background: rgba(56, 189, 248, 0.12);
    border-color: #38bdf8;
    color: #38bdf8;
  }

  .cover-title-container {
    margin-top: 10px;
  }

  .cover-super-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 8px;
  }

  .cover-main-title {
    font-size: 42px;
    font-weight: 900;
    line-height: 1.05;
    color: #ffffff;
    letter-spacing: -0.5px;
    margin: 0 0 16px 0;
  }

  .cover-main-title span {
    color: #ccff00;
  }

  .cover-subtitle {
    font-size: 15px;
    font-weight: 400;
    color: #94a3b8;
    line-height: 1.5;
    max-width: 620px;
  }

  .cover-feature-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 30px;
  }

  .cover-feature-card {
    background: rgba(20, 20, 24, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 14px;
  }

  .cover-feature-card h4 {
    margin: 0 0 6px 0;
    font-size: 13px;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cover-feature-card p {
    margin: 0;
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.45;
  }

  .cover-meta {
    margin-top: 35px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .cover-meta-col {
    font-size: 11.5px;
    color: #94a3b8;
    line-height: 1.6;
  }

  .cover-meta-col strong {
    color: #f8fafc;
  }

  /* CABEÇALHOS E TÍTULOS */
  h1, h2, h3, h4, h5 {
    color: #0f172a;
    font-weight: 700;
    page-break-after: avoid;
    break-after: avoid;
  }

  h1 {
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .h1-number {
    background: #0f172a;
    color: #ccff00;
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 800;
  }

  h2 {
    font-size: 15px;
    margin-top: 16px;
    margin-bottom: 8px;
    color: #1e293b;
    border-left: 4px solid #0284c7;
    padding-left: 9px;
  }

  h3 {
    font-size: 13px;
    margin-top: 12px;
    margin-bottom: 6px;
    color: #334155;
  }

  p {
    margin-top: 0;
    margin-bottom: 9px;
    text-align: justify;
    line-height: 1.5;
  }

  /* LISTAS E BADGES */
  ul, ol {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
    line-height: 1.45;
  }

  code {
    font-family: "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace;
    font-size: 11px;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 4.5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  pre {
    background: #09090b;
    color: #f8fafc;
    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
    font-size: 10.5px;
    line-height: 1.42;
    padding: 10px 12px;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid #27272a;
    margin-top: 6px;
    margin-bottom: 10px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  pre code {
    background: transparent;
    border: none;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }

  /* TABELAS */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 12px;
    font-size: 11px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  th, td {
    padding: 6px 8px;
    text-align: left;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }

  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* CAIXAS DE DESTAQUE / CALLOUTS */
  .callout {
    border-radius: 6px;
    padding: 10px 12px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
    border-left: 4px solid;
    font-size: 11.5px;
    line-height: 1.45;
  }

  .callout-title {
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .callout-info {
    background-color: #f0f9ff;
    border-left-color: #0284c7;
    color: #0369a1;
  }
  .callout-info .callout-title { color: #0284c7; }

  .callout-biomec {
    background-color: #f7fee7;
    border-left-color: #65a30d;
    color: #365314;
  }
  .callout-biomec .callout-title { color: #4d7c0f; }

  .callout-warning {
    background-color: #fffbeb;
    border-left-color: #d97706;
    color: #92400e;
  }
  .callout-warning .callout-title { color: #b45309; }

  .callout-arch {
    background-color: #faf5ff;
    border-left-color: #9333ea;
    color: #581c87;
  }
  .callout-arch .callout-title { color: #7e22ce; }

  /* CAIXA DE EQUAÇÃO MATEMÁTICA */
  .math-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 10px 14px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .math-formula {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 14px;
    color: #0f172a;
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 5px;
    padding: 8px 12px;
    text-align: center;
    margin: 6px 0;
  }

  .math-desc {
    font-size: 11px;
    color: #475569;
    line-height: 1.4;
  }

  /* ESTRUTURA VISUAL DE ÁRVORE */
  .tree-container {
    background: #09090b;
    color: #f8fafc;
    border: 1px solid #27272a;
    border-radius: 7px;
    padding: 12px 14px;
    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
    font-size: 11px;
    line-height: 1.48;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .tree-branch { color: #64748b; }
  .tree-folder { color: #38bdf8; font-weight: 700; }
  .tree-file { color: #f1f5f9; }
  .tree-comment { color: #a3e635; font-style: italic; }

  .tree-tag {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 9.5px;
    font-weight: 600;
    margin-left: 5px;
  }

  .tag-hook { background: #2563eb; color: #fff; }
  .tag-route { background: #059669; color: #fff; }
  .tag-service { background: #7c3aed; color: #fff; }
  .tag-type { background: #d97706; color: #fff; }

  /* CARDS DE FLUXO E MÁQUINA DE ESTADOS */
  .fsm-diagram {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .fsm-step {
    display: flex;
    align-items: stretch;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }

  .fsm-step-number {
    width: 38px;
    background: #0f172a;
    color: #ccff00;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }

  .fsm-step-content {
    padding: 8px 12px;
    flex: 1;
  }

  .fsm-step-content h4 {
    margin: 0 0 3px 0;
    font-size: 12px;
    color: #0f172a;
  }

  .fsm-step-content p {
    margin: 0;
    font-size: 11px;
    color: #475569;
    line-height: 1.35;
  }

  .fsm-arrow {
    text-align: center;
    color: #0284c7;
    font-weight: bold;
    font-size: 12px;
    line-height: 1;
  }

  /* SUMÁRIO NAVEGÁVEL */
  .toc-container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 12px 16px;
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .toc-title {
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #cbd5e1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toc-list {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 11.5px;
    border-bottom: 1px dotted #cbd5e1;
    padding-bottom: 1.5px;
  }

  .toc-item.level-1 {
    font-weight: 700;
    color: #0f172a;
    margin-top: 6px;
    border-bottom-style: solid;
    border-bottom-color: #94a3b8;
  }

  .toc-item.level-2 {
    padding-left: 14px;
    color: #334155;
    font-weight: 500;
  }

  .badge-metric {
    display: inline-block;
    padding: 1.5px 6px;
    border-radius: 3px;
    font-size: 10.5px;
    font-weight: 700;
  }
  .badge-volt { background: #d9f99d; color: #365314; border: 1px solid #bef264; }
  .badge-cyan { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

  /* CARDS GRID DE CONCEITOS */
  .concept-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .concept-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
  }

  .concept-card h4 {
    margin: 0 0 5px 0;
    font-size: 12px;
    color: #0f172a;
  }

  .concept-card p {
    margin: 0;
    font-size: 11px;
    color: #475569;
    line-height: 1.4;
  }

</style>
</head>
<body>

  <!-- PÁGINA 1: CAPA PRINCIPAL -->
  <div class="cover-page">
    <div>
      <div class="cover-badge-row">
        <span class="cover-badge neon">Fatec • PAM</span>
        <span class="cover-badge cyan">Expo SDK 57</span>
        <span class="cover-badge">React Native 0.86</span>
        <span class="cover-badge">TypeScript 6.0</span>
        <span class="cover-badge">Engenharia de Sensores</span>
      </div>

      <div class="cover-title-container">
        <div class="cover-super-title">Manual de Engenharia e Arquitetura de Software Mobile</div>
        <h1 class="cover-main-title">PAM <span>FITNESS</span></h1>
        <div class="cover-subtitle">
          Sistema de monitoramento biomecânico e telemetria esportiva com smartphone no braço, acelerômetro tridimensional, rastreamento GPS geodésico, diário visual por câmera e persistência local.
        </div>
      </div>

      <div class="cover-feature-cards">
        <div class="cover-feature-card">
          <h4>⚡ Acelerômetro FSM</h4>
          <p>Detecção de repetições e cadência muscular em tempo real via magnitude tridimensional euclidiana e debounce temporal de 700ms.</p>
        </div>
        <div class="cover-feature-card">
          <h4>🌐 GPS & Pacing</h4>
          <p>Cálculo de distância incremental por trigonometria esférica de Haversine e conversão para ritmo atlético internacional (min/km).</p>
        </div>
        <div class="cover-feature-card">
          <h4>📷 Auditoria Visual</h4>
          <p>Captura de fotos de séries, anilhas e maquinário via CameraView nativa com persistência offline através do AsyncStorage.</p>
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-col">
        <div><strong>Instituição:</strong> Faculdade de Tecnologia (FATEC)</div>
        <div><strong>Disciplina:</strong> Programação de Aplicativos Mobile (PAM)</div>
        <div><strong>Projeto:</strong> PAM Fitness — Monitor de Treino por Hardware</div>
      </div>
      <div class="cover-meta-col" style="text-align: right;">
        <div><strong>Versão da Documentação:</strong> 1.0.0 (Consolidada)</div>
        <div><strong>Data de Conclusão:</strong> Outubro de 2026</div>
        <div><strong>Status:</strong> Aprovado para Avaliação e Produção</div>
      </div>
    </div>
  </div>

  <!-- PÁGINA 2: SUMÁRIO E SÍNTESE EXECUTIVA -->
  <div class="page">
    <div class="toc-container">
      <div class="toc-title">
        <span>ÍNDICE GERAL DE CONTEÚDO</span>
        <span style="font-size: 11px; font-weight: 500; color: #64748b;">Manual Técnico Consolidado</span>
      </div>

      <ul class="toc-list">
        <li class="toc-item level-1">
          <span>1. Visão Geral, Arquitetura e Escopo do Sistema</span>
          <span>Página 3</span>
        </li>
        <li class="toc-item level-2"><span>1.1 Proposta de Valor e Conceito do Smartphone no Braço</span><span>1.1</span></li>
        <li class="toc-item level-2"><span>1.2 Casos de Uso Primários do Aplicativo</span><span>1.2</span></li>
        <li class="toc-item level-2"><span>1.3 Identidade Visual e Design System (Dark Mode Atlântico)</span><span>1.3</span></li>

        <li class="toc-item level-1">
          <span>2. Estruturas de Árvore e Mapeamento Arquitetural</span>
          <span>Páginas 4-5</span>
        </li>
        <li class="toc-item level-2"><span>2.1 Árvore Completa de Diretórios e Arquivos do Projeto</span><span>2.1</span></li>
        <li class="toc-item level-2"><span>2.2 Árvore de Navegação e Telas (Expo Router)</span><span>2.2</span></li>
        <li class="toc-item level-2"><span>2.3 Árvore de Fluxo de Dados e Camadas de Estado</span><span>2.3</span></li>

        <li class="toc-item level-1">
          <span>3. Engenharia e Física dos Sensores de Hardware</span>
          <span>Páginas 6-8</span>
        </li>
        <li class="toc-item level-2"><span>3.1 Sensor de Movimento (Acelerômetro) & Magnitude Euclidiana</span><span>3.1</span></li>
        <li class="toc-item level-2"><span>3.2 Máquina de Estados Finita (FSM), Debounce e Cadência</span><span>3.2</span></li>
        <li class="toc-item level-2"><span>3.3 Sensor de GPS (Haversine e Pacing) & Sensor de Câmera</span><span>3.3</span></li>

        <li class="toc-item level-1">
          <span>4. Catálogo Detalhado de Hooks e Funções React / Expo</span>
          <span>Páginas 9-10</span>
        </li>
        <li class="toc-item level-2"><span>4.1 Hooks Nativos do React (useState, useEffect, useRef, useCallback)</span><span>4.1</span></li>
        <li class="toc-item level-2"><span>4.2 Hooks Específicos do Expo (useRouter, useFocusEffect, useCameraPermissions)</span><span>4.2</span></li>
        <li class="toc-item level-2"><span>4.3 Matriz de Otimização e Prevenção de Vazamento de Memória</span><span>4.3</span></li>

        <li class="toc-item level-1">
          <span>5. Catálogo de Serviços, Persistência Local e Tipagem TypeScript</span>
          <span>Páginas 11-12</span>
        </li>
        <li class="toc-item level-2"><span>5.1 Funções Utilitárias Geográficas e Formatações (locationService.ts)</span><span>5.1</span></li>
        <li class="toc-item level-2"><span>5.2 Persistência Offline com AsyncStorage (storage.ts)</span><span>5.2</span></li>
        <li class="toc-item level-2"><span>5.3 Contratos de Dados e Tipagem Estrita (workout.ts)</span><span>5.3</span></li>

        <li class="toc-item level-1">
          <span>6. Handlers de Interface, Telas e Fluxo do Treino</span>
          <span>Páginas 13-14</span>
        </li>
        <li class="toc-item level-2"><span>6.1 Handlers das Telas (Treino Ativo, Câmera e Histórico)</span><span>6.1</span></li>
        <li class="toc-item level-2"><span>6.2 Diagrama Integrado do Ciclo de Vida da Sessão</span><span>6.2</span></li>

        <li class="toc-item level-1">
          <span>7. Boas Práticas, Mobile-First e Avaliação FATEC</span>
          <span>Página 15</span>
        </li>
        <li class="toc-item level-2"><span>7.1 Gestão Energética, Continuous Native Generation (CNG) e Testes</span><span>7.1</span></li>
      </ul>
    </div>

    <div class="callout callout-info avoid-break">
      <div class="callout-title">ℹ️ Resumo Executivo da Engenharia do Projeto</div>
      <p>
        O <strong>PAM Fitness</strong> é uma aplicação móvel desenvolvida no ecossistema <strong>React Native</strong> com <strong>Expo SDK 57</strong> e <strong>TypeScript</strong>. O projeto transforma o smartphone em um dispositivo vestível esportivo autossuficiente ao ser fixado no braço via braçadeira elástica, dispensando smartwatches adicionais. Integra simultaneamente três sensores nativos de hardware: o <strong>acelerômetro linear</strong> (para contagem biomecânica de repetições e cadência muscular), o <strong>receptor GPS</strong> (para telemetria de distância e ritmo de pacing) e o <strong>sensor CMOS de câmera</strong> (para registro fotográfico e auditoria de cargas e anilhas). Todos os dados são consolidados localmente via <code>AsyncStorage</code> garantindo funcionamento <em>offline-first</em> ininterrupto.
      </p>
    </div>

    <div class="concept-grid">
      <div class="concept-card">
        <h4>🎯 Eliminação de Acessórios</h4>
        <p>Substitui sensores caros de pulso usando o processamento interno do próprio smartphone na braçadeira esportiva.</p>
      </div>
      <div class="concept-card">
        <h4>🛡️ Arquitetura Robusta</h4>
        <p>Desacoplamento estrito entre UI (Expo Router), controle (Hooks), lógica pura (Services) e dados (TypeScript).</p>
      </div>
    </div>
  </div>

  <!-- PÁGINA 3: CAPÍTULO 1 - VISÃO GERAL, CASOS DE USO E DESIGN -->
  <div class="page">
    <h1><span class="h1-number">01</span> Visão Geral, Arquitetura e Escopo do Sistema</h1>

    <h2>1.1. Proposta de Valor e Conceito do Smartphone no Braço</h2>
    <p>
      No treinamento resistido (musculação) e funcional, a quantificação precisa de esforço, repetições e cadência depende tipicamente de smartwatches caros ou anotações manuais que interrompem a dinâmica da sessão. O <strong>PAM Fitness</strong> converte o smartphone preso a uma braçadeira no braço em um dispositivo esportivo completo:
    </p>
    <ul>
      <li><strong>Contador Biomecânico de Repetições:</strong> Analisa os vetores de aceleração linear do membro em três dimensões, discriminando as fases concêntrica (subida/contração) e excêntrica (descida/alongamento).</li>
      <li><strong>Computador de Bordo de Corrida:</strong> Monitora o deslocamento geográfico contínuo por satélite, calculando velocidade instantânea, velocidade média e ritmo de <em>pacing</em> (min/km).</li>
      <li><strong>Diário Visual de Séries:</strong> Registra instantaneamente fotos de maquinário e cargas com notas da série.</li>
    </ul>

    <h2>1.2. Casos de Uso Primários do Aplicativo</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Caso de Uso</th>
          <th style="width: 35%;">Fluxo do Usuário</th>
          <th style="width: 40%;">Módulos e Sensores Acionados</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Treino de Força</strong></td>
          <td>Atleta prende o celular no braço, inicia o treino e executa repetições (rosca, elevação, supino).</td>
          <td><code>useWorkoutTimer</code>, <code>useArmMotionTracker</code> (leitura do acelerômetro a cada 100ms via <code>expo-sensors</code>).</td>
        </tr>
        <tr>
          <td><strong>2. Cardio / Corrida</strong></td>
          <td>Na corrida ou aquecimento, alterna para a aba de Pacing e monitora velocidade e ritmo em min/km.</td>
          <td><code>useLocationTracker</code> (GPS de alta precisão via <code>expo-location</code>), <code>locationService</code> (Fórmula de Haversine).</td>
        </tr>
        <tr>
          <td><strong>3. Auditoria Visual</strong></td>
          <td>Após a série pesada, clica no atalho da câmera, fotografa as anilhas e anota a carga do exercício.</td>
          <td><code>expo-camera</code> (componente <code>CameraView</code>), <code>useCameraPermissions</code>, estrutura <code>WorkoutPhoto</code>.</td>
        </tr>
        <tr>
          <td><strong>4. Fechamento e Histórico</strong></td>
          <td>Finaliza o treino, revisa o resumo no modal e confirma o salvamento permanente offline.</td>
          <td><code>storage.ts</code> (serialização JSON em <code>AsyncStorage</code>), tela <code>historico.tsx</code> para auditoria.</td>
        </tr>
      </tbody>
    </table>

    <h2>1.3. Identidade Visual e Tendências de Design (Dark Mode Atlântico)</h2>
    <p>
      O design do aplicativo adota o <strong>Minimalismo Esportivo de Alto Contraste</strong>, otimizado para economia de energia em telas OLED e leitura sob iluminação intensa de academias:
    </p>
    <ul>
      <li><strong>Paleta Escura Atlântica:</strong> Fundo <code>#09090B</code> e cartões <code>#141416</code> com bordas <code>#27272A</code>.</li>
      <li><strong>Neon Volt (<span class="badge-metric badge-volt">#CCFF00</span>):</strong> Acento visual de alta energia para métricas biomecânicas (reps, cadência RPM).</li>
      <li><strong>Cyber Cyan (<span class="badge-metric badge-cyan">#38BDF8</span>):</strong> Acento geodésico para telemetria de navegação (pacing, distância em km, GPS).</li>
      <li><strong>Tipografia Tabular de Alta Escala:</strong> Dígitos centrais entre 48px e 72px com <code>tabular-nums</code> legíveis a 40 cm.</li>
      <li><strong>Micro-indicadores de Status:</strong> Pílulas táteis luminosas indicando sinal de satélite e prontidão de sensores.</li>
    </ul>
  </div>

  <!-- PÁGINA 4: CAPÍTULO 2 - ÁRVORE DE DIRETÓRIOS E ARQUIVOS -->
  <div class="page">
    <h1><span class="h1-number">02</span> Estruturas de Árvore e Mapeamento Arquitetural</h1>

    <p>
      Para facilitar a compreensão global da solução, o sistema é mapeado em três estruturas hierárquicas: a <strong>árvore de arquivos</strong> (abaixo), a <strong>árvore de navegação</strong> e a <strong>árvore de estado</strong> (página seguinte).
    </p>

    <h2>2.1. Árvore Completa de Diretórios e Arquivos do Projeto</h2>

    <div class="tree-container">
      <div><span class="tree-folder">App PAM/</span> <span class="tree-comment"># Raiz do projeto React Native (Expo SDK 57)</span></div>
      <div><span class="tree-branch">├── </span><span class="tree-folder">docs/</span> <span class="tree-comment"># Documentação técnica e especificações acadêmicas</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-file">README.md</span> <span class="tree-comment"># Visão geral, arquitetura e escopo</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-file">SENSORES.md</span> <span class="tree-comment"># Engenharia física e matemática dos 3 sensores</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-file">FUNCOES_REACT.md</span> <span class="tree-comment"># Catálogo explicativo de hooks React e Expo</span></div>
      <div><span class="tree-branch">│   └── </span><span class="tree-file">GUIA_DE_CHAMADAS.md</span> <span class="tree-comment"># Catálogo de assinaturas e fluxo de execução</span></div>
      <div><span class="tree-branch">├── </span><span class="tree-folder">src/</span> <span class="tree-comment"># Código-fonte TypeScript da aplicação</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-folder">app/</span> <span class="tree-comment"># Telas nativas gerenciadas pelo Expo Router</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">_layout.tsx</span> <span class="tree-tag tag-route">Layout</span> <span class="tree-comment"># Roteador em abas inferiores (Tabs nativas)</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">index.tsx</span> <span class="tree-tag tag-route">Tela</span> <span class="tree-comment"># Painel de treino ativo, repetições e pacing</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">camera.tsx</span> <span class="tree-tag tag-route">Tela</span> <span class="tree-comment"># Visor da câmera, flash e anotação de série</span></div>
      <div><span class="tree-branch">│   │   └── </span><span class="tree-file">historico.tsx</span> <span class="tree-tag tag-route">Tela</span> <span class="tree-comment"># Lista de sessões passadas e galeria de fotos</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-folder">constants/</span></div>
      <div><span class="tree-branch">│   │   └── </span><span class="tree-file">theme.ts</span> <span class="tree-comment"># Paleta Dark Mode, espaçamentos e raios de borda</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-folder">hooks/</span> <span class="tree-comment"># Lógica de controle e abstração de hardware</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">useWorkoutTimer.ts</span> <span class="tree-tag tag-hook">Hook</span> <span class="tree-comment"># Cronômetro atômico com start/pause/resume</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">useArmMotionTracker.ts</span> <span class="tree-tag tag-hook">Hook</span> <span class="tree-comment"># Acelerômetro, magnitude e FSM de repetições</span></div>
      <div><span class="tree-branch">│   │   └── </span><span class="tree-file">useLocationTracker.ts</span> <span class="tree-tag tag-hook">Hook</span> <span class="tree-comment"># GPS contínuo, Haversine e cálculo de pacing</span></div>
      <div><span class="tree-branch">│   ├── </span><span class="tree-folder">services/</span> <span class="tree-comment"># Camada de serviços puros e persistência</span></div>
      <div><span class="tree-branch">│   │   ├── </span><span class="tree-file">locationService.ts</span> <span class="tree-tag tag-service">Serviço</span> <span class="tree-comment"># Matemática esférica, conversão km/h e pacing</span></div>
      <div><span class="tree-branch">│   │   └── </span><span class="tree-file">storage.ts</span> <span class="tree-tag tag-service">Serviço</span> <span class="tree-comment"># Operações CRUD offline via AsyncStorage</span></div>
      <div><span class="tree-branch">│   └── </span><span class="tree-folder">types/</span> <span class="tree-comment"># Contratos de tipagem estrita</span></div>
      <div><span class="tree-branch">│       ├── </span><span class="tree-file">workout.ts</span> <span class="tree-tag tag-type">Tipos</span> <span class="tree-comment"># Interfaces LocationPoint, WorkoutSession, etc.</span></div>
      <div><span class="tree-branch">│       └── </span><span class="tree-file">declarations.d.ts</span> <span class="tree-comment"># Tipagem de assets e estilos globais</span></div>
      <div><span class="tree-branch">├── </span><span class="tree-file">app.json</span> <span class="tree-comment"># Manifesto Expo, permissões nativas e plugins CNG</span></div>
      <div><span class="tree-branch">└── </span><span class="tree-file">package.json</span> <span class="tree-comment"># Especificação de dependências e scripts de execução</span></div>
    </div>

    <h2>Papel Arquitetural de Cada Diretório</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Diretório / Arquivo</th>
          <th style="width: 30%;">Responsabilidade Principal</th>
          <th style="width: 45%;">Padrão Arquitetural Aplicado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>src/app/</code></td>
          <td>Telas e rotas nativas</td>
          <td>File-based routing (Expo Router). Isolamento completo entre telas e roteador central.</td>
        </tr>
        <tr>
          <td><code>src/hooks/</code></td>
          <td>Lógica reativa e sensores</td>
          <td>Custom Hooks. Encapsula listeners de hardware com funções determinísticas de cleanup.</td>
        </tr>
        <tr>
          <td><code>src/services/</code></td>
          <td>Cálculos puros e storage</td>
          <td>Pure Services e DAO (Data Access Object) offline sobre AsyncStorage.</td>
        </tr>
        <tr>
          <td><code>src/types/</code></td>
          <td>Contratos TypeScript</td>
          <td>Single Source of Truth para tipagem de telemetria, coordenadas e sessões salvas.</td>
        </tr>
        <tr>
          <td><code>src/constants/</code></td>
          <td>Tokens visuais</td>
          <td>Design Tokens consolidados (Colors, Spacing, Radius, Typography).</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PÁGINA 5: ÁRVORES DE NAVEGAÇÃO E DE FLUXO DE ESTADO -->
  <div class="page">
    <h2>2.2. Árvore de Navegação e Hierarquia de Telas (Expo Router)</h2>
    <p>
      O roteamento utiliza abas nativas e modais contextuais para manter o treino acessível sem perda de estado:
    </p>

    <div class="tree-container">
      <div><span class="tree-folder">[RootLayout: src/app/_layout.tsx]</span> <span class="tree-comment"># Configura TabBar inferior escura</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> ├──► </span><span class="tree-file">Aba 1: "index" (Treino Ativo)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Card do Cronômetro Principal (useWorkoutTimer)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Seletor de Modo: [ Modo Braço / Reps ]  vs  [ Modo GPS & Pacing ]</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Card de Métricas de Repetições (Magnitude G, Cadência RPM, FSM)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Card de Métricas de Corrida (Pace instantâneo, Distância km, Vel. média)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Atalho Rápido para Captura de Foto (router.push('/camera'))</span></div>
      <div><span class="tree-branch"> │     └── </span><span class="tree-folder">[Modal de Conclusão de Treino]</span> <span class="tree-comment"># Resumo antes de gravar no storage</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> ├──► </span><span class="tree-file">Aba 2: "camera" (Câmera de Séries)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Visor Nativo CameraView (Facing Frontal/Traseiro, Torch Flash)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Controle de Permissão useCameraPermissions()</span></div>
      <div><span class="tree-branch"> │     └── </span><span class="tree-folder">[Modo Preview Pós-Disparo]</span></div>
      <div><span class="tree-branch"> │           ├── </span><span class="tree-comment">Campo de Texto para Anotação da Carga/Exercício</span></div>
      <div><span class="tree-branch"> │           ├── </span><span class="tree-comment">Botão Repetir Foto (Descarta URI temporária)</span></div>
      <div><span class="tree-branch"> │           └── </span><span class="tree-comment">Botão Salvar Foto (Persiste via storage.ts e navega)</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> └──► </span><span class="tree-file">Aba 3: "historico" (Histórico & Auditoria)</span></div>
      <div><span class="tree-branch">       ├── </span><span class="tree-comment">Recarregamento Automático em Foco (useFocusEffect)</span></div>
      <div><span class="tree-branch">       ├── </span><span class="tree-comment">Cards de Sessões Salvas (Data, Duração, Reps, Distância, Pacing)</span></div>
      <div><span class="tree-branch">       ├── </span><span class="tree-comment">Miniaturas de Fotos Anexadas à Sessão</span></div>
      <div><span class="tree-branch">       ├── </span><span class="tree-comment">Ações: Excluir Sessão Individual ou Limpar Histórico Total</span></div>
      <div><span class="tree-branch">       └── </span><span class="tree-folder">[Modal de Foto em Tela Cheia]</span> <span class="tree-comment"># Inspeção detalhada de anilhas/cargas</span></div>
    </div>

    <h2>2.3. Árvore de Fluxo de Dados e Camadas de Estado</h2>
    <p>
      O fluxo de dados transita em uma via unidirecional desde a recepção física dos sensores até a persistência offline:
    </p>

    <div class="tree-container">
      <div><span class="tree-folder">CAMADA 1: HARDWARE NATIVO DO SMARTPHONE</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">Acelerômetro MEMS</span> <span class="tree-comment">► Gera vetores x, y, z a cada 100ms (10 Hz)</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">Receptor GNSS/GPS</span> <span class="tree-comment">► Gera coordenadas lat, lon, velocidade e precisão a cada 1s (1 Hz)</span></div>
      <div><span class="tree-branch"> └── </span><span class="tree-file">Sensor Óptico CMOS</span> <span class="tree-comment">► Captura bitmap JPEG comprimido (qualidade 0.85)</span></div>
      <div><span class="tree-branch">       │</span></div>
      <div><span class="tree-folder">CAMADA 2: HOOKS CUSTOMIZADOS DE ESTADO E PROCESSAMENTO</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">useArmMotionTracker</span> <span class="tree-comment">► Magnitude Euclidiana + FSM Pico/Vale + Debounce 700ms</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">useLocationTracker</span>  <span class="tree-comment">► Filtragem de saltos + Haversine incremental + Pacing</span></div>
      <div><span class="tree-branch"> └── </span><span class="tree-file">useWorkoutTimer</span>     <span class="tree-comment">► Contagem atômica de segundos via setInterval protegido</span></div>
      <div><span class="tree-branch">       │</span></div>
      <div><span class="tree-folder">CAMADA 3: SERVIÇOS PUROS E MATEMÁTICA</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">locationService.ts</span>  <span class="tree-comment">► calculateDistanceKm, metersPerSecondToKmh, formatInstantPace</span></div>
      <div><span class="tree-branch"> └── </span><span class="tree-file">storage.ts</span>          <span class="tree-comment">► getWorkoutSessions, saveWorkoutSession, deleteWorkoutSession</span></div>
      <div><span class="tree-branch">       │</span></div>
      <div><span class="tree-folder">CAMADA 4: PERSISTÊNCIA LOCAL (OFFLINE FIRST)</span></div>
      <div><span class="tree-branch"> └── </span><span class="tree-file">@react-native-async-storage/async-storage</span> <span class="tree-comment">► Chave fixa: '@app_pam:workouts_v1'</span></div>
      <div><span class="tree-branch">       │</span></div>
      <div><span class="tree-folder">CAMADA 5: APRESENTAÇÃO E AUDITORIA (UI)</span></div>
      <div><span class="tree-branch"> ├── </span><span class="tree-file">src/app/index.tsx</span>     <span class="tree-comment">► Renderização reativa de repetições e ritmo em 60fps</span></div>
      <div><span class="tree-branch"> └── </span><span class="tree-file">src/app/historico.tsx</span> <span class="tree-comment">► Listagem histórica indexada com recuperação de fotos</span></div>
    </div>
  </div>

  <!-- PÁGINA 6: CAPÍTULO 3 - ENGENHARIA DE SENSORES: ACELERÔMETRO -->
  <div class="page">
    <h1><span class="h1-number">03</span> Engenharia e Física dos Sensores de Hardware</h1>

    <p>
      O núcleo técnico do <strong>PAM Fitness</strong> consiste no processamento matemático em tempo real de três sensores físicos integrados ao smartphone: acelerômetro, GPS e câmera.
    </p>

    <h2>3.1. Sensor de Movimento (Acelerômetro) — Celular no Braço</h2>

    <h3>3.1.1. Princípio Físico e Eixos Espaciais</h3>
    <p>
      O acelerômetro é um sensor eletromecânico MEMS (<em>Micro-Electro-Mechanical Systems</em>) que mede a aceleração linear decomposta em três eixos ortogonais:
    </p>
    <ul>
      <li><strong>Eixo X:</strong> Aceleração lateral (esquerda/direita em relação à tela).</li>
      <li><strong>Eixo Y:</strong> Aceleração longitudinal (cima/baixo no chassi do aparelho).</li>
      <li><strong>Eixo Z:</strong> Aceleração perpendicular ao plano da tela (frente/trás).</li>
    </ul>
    <p>
      Em repouso na superfície da Terra, o sensor não acusa aceleração nula, mas sim a força da aceleração estática da gravidade (1.0g ≈ 9.81 m/s²) apontando em direção ao centro do planeta.
    </p>

    <h3>3.1.2. Magnitude Resultante Tridimensional</h3>
    <p>
      A orientação angular do celular na braçadeira esportiva varia dependendo de como o atleta o veste (no bíceps, antebraço, voltado para frente ou para o lado). Monitorar um eixo isolado geraria contagens erráticas. O sistema soluciona essa variabilidade calculando a <strong>Magnitude Euclidiana Tridimensional</strong>:
    </p>

    <div class="math-box">
      <div class="math-formula">
        <strong>Magnitude</strong> = √( x² + y² + z² )
      </div>
      <div class="math-desc">
        Onde x, y e z representam as acelerações instantâneas medidas em unidades de g pelo sensor. Sendo a magnitude uma grandeza escalar tridimensional, qualquer flexão muscular concêntrica ou extensão excêntrica produzirá uma variação mensurável, independentemente do alinhamento angular do aparelho.
      </div>
    </div>

    <div class="callout callout-arch avoid-break">
      <div class="callout-title">📐 Por que a Magnitude Tridimensional é Superior a Eixos Isolados?</div>
      <p>
        Se um algoritmo monitorasse apenas o eixo Y, ao realizar uma rosca direta com o celular colocado na lateral do braço, a aceleração se projetaria majoritariamente nos eixos X e Z, fazendo o app falhar na contagem. A magnitude euclidiana consolida os três vetores em um escalar invariante a rotações espaciais.
      </p>
    </div>

    <h3>3.1.3. Controles Manuais de Ajuste Fino</h3>
    <p>
      Para assegurar a máxima fidedignidade ao atleta, além da contagem automática da máquina de estados, o hook <code>useArmMotionTracker</code> expõe duas funções de ajuste com estabilidade referencial via <code>useCallback</code>:
    </p>
    <ul>
      <li><code>addManualRep()</code>: Permite ao usuário somar 1 repetição manualmente caso tenha executado um movimento de amplitude muito curta que não tenha atingido o limiar.</li>
      <li><code>removeManualRep()</code>: Permite decrementar uma repetição caso um movimento brusco acidental tenha sido computado, com proteção para nunca assumir valores negativos (<code>Math.max(0, prev - 1)</code>).</li>
    </ul>
  </div>

  <!-- PÁGINA 7: FSM DE REPETIÇÕES E CADÊNCIA MUSCULAR -->
  <div class="page">
    <h2>3.2. Máquina de Estados Finita (FSM), Debounce e Cadência</h2>

    <h3>3.2.1. Algoritmo da Máquina de Estados de Repetições</h3>
    <p>
      O fluxo de detecção do ciclo biomecânico completo é governado por uma Máquina de Estados Finita (FSM) com filtragem de ruído implementada no hook <code>useArmMotionTracker</code>:
    </p>

    <div class="fsm-diagram">
      <div class="fsm-step">
        <div class="fsm-step-number">1</div>
        <div class="fsm-step-content">
          <h4>ESTADO: REPOUSO / AGUARDANDO PICO</h4>
          <p>O membro do atleta encontra-se na posição inicial do exercício. A magnitude resultante oscila próxima a <strong>1.0g</strong> (gravidade estática da Terra). Estado interno: <code>repStateRef = 'esperando_pico'</code>.</p>
        </div>
      </div>
      <div class="fsm-arrow">▼ Aceleração concêntrica: Magnitude ≥ 1.25g</div>
      <div class="fsm-step">
        <div class="fsm-step-number">2</div>
        <div class="fsm-step-content">
          <h4>ESTADO: SUBIDA DETECTADA (AGUARDANDO VALE)</h4>
          <p>O músculo se contrai para erguer o peso. O braço acelera para cima, elevando a força resultante além do limiar superior de <strong>1.25g</strong>. O estado transiciona para <code>repStateRef = 'esperando_vale'</code> e <code>motionState = 'subindo'</code>.</p>
        </div>
      </div>
      <div class="fsm-arrow">▼ Desaceleração excêntrica: Magnitude ≤ 0.85g E intervalo decorrido &gt; 700ms</div>
      <div class="fsm-step">
        <div class="fsm-step-number">3</div>
        <div class="fsm-step-content">
          <h4>ESTADO: REPETIÇÃO CONTADA (+1 REP)</h4>
          <p>Ao alcançar a extensão controlada no ponto inferior, a força cai abaixo de <strong>0.85g</strong>. Se decorridos mais de <strong>700ms</strong> da repetição anterior, o contador é incrementado, a cadência é recalculada e o estado retorna a aguardar novo pico.</p>
        </div>
      </div>
    </div>

    <div class="callout callout-biomec avoid-break">
      <div class="callout-title">⚡ Por que o filtro de Debounce de 700ms é indispensável?</div>
      <p>
        Na biomecânica do exercício resistido, nenhuma repetição com amplitude articular completa (<em>Range of Motion</em>) é executada fisiologicamente em menos de 0,7 segundos. Se um pico e um vale ocorressem em 200ms ou 300ms, isso corresponderia a tremor muscular por fadiga (clônus) ou choque mecânico de anilhas. O debounce temporal de 700ms descarta 100% dessas falsas detecções.
      </p>
    </div>

    <h3>3.2.2. Cálculo de Cadência em Tempo Real (RPM)</h3>
    <p>
      A cadência reflete a velocidade de execução em repetições por minuto. O aplicativo mantém um vetor deslizante de timestamps das repetições ocorridas nos últimos 30 segundos:
    </p>

    <div class="math-box">
      <div class="math-formula">
        <strong>RPM</strong> = ( Repetições nos últimos 30 segundos ) × 2
      </div>
      <div class="math-desc">
        Ao multiplicar por 2, projeta-se o ritmo exato para 60 segundos (1 minuto). Repetições ocorridas há mais de 30.000 ms são descartadas automaticamente através do filtro: <code>recentRepsTimestampsRef.current.filter(t =&gt; t &gt; cutoff)</code>.
      </div>
    </div>

    <p>
      Esse modelo dinâmico permite ao praticante manter a consistência de velocidade mesmo quando a fadiga muscular se acumula ao final de séries extensas.
    </p>
  </div>

  <!-- PÁGINA 8: GPS, HAVERSINE, PACING E CÂMERA -->
  <div class="page">
    <h2>3.3. Sensor de Localização (GPS) e Ritmo de Pacing</h2>

    <h3>3.3.1. Captura de Satélite e Cálculo Geodésico (Fórmula de Haversine)</h3>
    <p>
      O hook <code>useLocationTracker</code> utiliza a biblioteca nativa <code>expo-location</code> configurada com alta resolução (<code>Accuracy.High</code>, amostragem de 1 segundo ou 2 metros). A distância entre coordenadas consecutivas é computada pela <strong>Fórmula de Haversine</strong>:
    </p>

    <div class="math-box">
      <div class="math-formula">
        a = sin²( Δlat / 2 ) + cos( lat₁ ) · cos( lat₂ ) · sin²( Δlon / 2 )
      </div>
      <div class="math-formula" style="margin-top: 4px;">
        c = 2 · atan2( √a, √( 1 - a ) ) &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Distância (km)</strong> = R · c &nbsp; (com R = 6.371 km)
      </div>
      <div class="math-desc">
        Onde Δlat e Δlon são as diferenças de coordenadas convertidas em radianos (graus × π / 180). Saltos anômalos de sinal de satélite superiores a 50 metros em 1 segundo (equivalente a 180 km/h) são rejeitados pelo filtro protetor.
      </div>
    </div>

    <h3>3.3.2. Ritmo de Pacing Esportivo (Minutos por Quilômetro)</h3>
    <p>
      No atletismo e na corrida de rua, a velocidade não é avaliada em km/h, mas sim pelo <strong>pacing</strong> (tempo necessário para percorrer 1 km):
    </p>
    <ul>
      <li>Se a velocidade instantânea do GPS for inferior a 0.5 m/s (~1.8 km/h), o app identifica repouso ou semáforo fechado e exibe o indicador neutro: <code>--'--"</code>.</li>
      <li>Para velocidades válidas, computa-se: <code>Segundos por km = 1000 / velocidade (m/s)</code>, decomposto em minutos e segundos restantes formatados no padrão internacional (ex: <code>05'24" /km</code>).</li>
      <li>O ritmo médio da sessão é calculado dividindo os segundos totais decorridos pela distância acumulada em quilômetros.</li>
    </ul>

    <h2>3.4. Sensor de Câmera (Expo Camera)</h2>
    <p>
      A auditoria visual de equipamentos e cargas é realizada pelo componente nativo <code>CameraView</code> no Expo SDK 57:
    </p>
    <ul>
      <li><strong>Controle de Permissões:</strong> Orquestrado via <code>useCameraPermissions()</code> com diálogo nativo amigável.</li>
      <li><strong>Alternância de Hardware:</strong> Alterna entre a lente traseira (<code>back</code>) para fotografar anilhas e frontal (<code>front</code>) para autorretratos, com controle contínuo do LED da lanterna (<code>enableTorch</code>).</li>
      <li><strong>Disparo e Auditoria:</strong> O disparo via <code>takePictureAsync({ quality: 0.85 })</code> gera o arquivo otimizado, permite anotação de texto (ex: "4x12 com 30kg cada lado") e associa a foto permanentemente à sessão ativa.</li>
    </ul>
  </div>

  <!-- PÁGINA 9: CAPÍTULO 4 - CATÁLOGO DE HOOKS REACT E EXPO (PARTE 1) -->
  <div class="page">
    <h1><span class="h1-number">04</span> Catálogo Detalhado de Hooks e Funções React / Expo</h1>

    <p>
      Este capítulo apresenta o catálogo exaustivo de todos os hooks de gerenciamento de estado e ciclo de vida utilizados no PAM Fitness, demonstrando a conformidade técnica com o modelo funcional do React 19 e Expo SDK 57.
    </p>

    <h2>4.1. Catálogo Completo do Hook <code>useState</code></h2>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Hook / Arquivo</th>
          <th style="width: 25%;">Variáveis Declaradas</th>
          <th style="width: 20%;">Tipo TypeScript</th>
          <th style="width: 35%;">Responsabilidade no PAM Fitness</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>useWorkoutTimer.ts</code></td>
          <td><code>seconds, isActive, isPaused</code></td>
          <td><code>number, boolean, boolean</code></td>
          <td>Contagem atômica de tempo de treino e estados de execução/pausa do cronômetro.</td>
        </tr>
        <tr>
          <td><code>useArmMotionTracker.ts</code></td>
          <td><code>reps, axes, intensityG, cadenceRpm, motionState</code></td>
          <td><code>number, {x,y,z}, number, number, 'repouso'|'subindo'|'descendo'</code></td>
          <td>Métricas biomecânicas reativas: contagem de reps, aceleração nos 3 eixos, força G e cadência RPM.</td>
        </tr>
        <tr>
          <td><code>useLocationTracker.ts</code></td>
          <td><code>permissionGranted, metrics</code></td>
          <td><code>boolean|null, LocationMetrics</code></td>
          <td>Status de autorização de GPS e métricas agregadas (pacing, distância em km, velocidades e rota).</td>
        </tr>
        <tr>
          <td><code>src/app/index.tsx</code></td>
          <td><code>activeTab, finishModalVisible, sessionPhotos</code></td>
          <td><code>'braco'|'pacing', boolean, WorkoutPhoto[]</code></td>
          <td>Alternância entre painel de braço e GPS, exibição do modal de finalização e fotos capturadas na sessão.</td>
        </tr>
        <tr>
          <td><code>src/app/camera.tsx</code></td>
          <td><code>facing, flashMode, capturedPhotoUri, photoNote, isCapturing</code></td>
          <td><code>CameraType, 'off'|'on', string|null, string, boolean</code></td>
          <td>Controles da câmera, URI da foto capturada em preview, anotação da série e bloqueio de cliques duplos.</td>
        </tr>
        <tr>
          <td><code>src/app/historico.tsx</code></td>
          <td><code>sessions, loading, selectedPhotoUri</code></td>
          <td><code>WorkoutSession[], boolean, string|null</code></td>
          <td>Lista de treinos históricos, estado de carregamento e URI da foto aberta em tela cheia no modal.</td>
        </tr>
      </tbody>
    </table>

    <h2>4.2. Gestão de Ciclo de Vida e Limpeza de Efeitos com <code>useEffect</code></h2>
    <p>
      O hook <code>useEffect</code> é reservado estritamente para conexões de hardware e timers, com <strong>funções de limpeza (cleanup) mandatórias</strong> para prevenir vazamentos de memória e drenagem de bateria:
    </p>
    <ul>
      <li>
        <strong>Temporizador (<code>useWorkoutTimer.ts</code>):</strong> Instancia um <code>setInterval</code> a cada 1.000ms condicionado a <code>isActive &amp;&amp; !isPaused</code>. A função de limpeza executa <code>clearInterval(intervalRef.current)</code> ao pausar ou desmontar.
      </li>
      <li>
        <strong>Acelerômetro (<code>useArmMotionTracker.ts</code>):</strong> Quando <code>isActive === true</code>, configura o intervalo em 100ms via <code>Accelerometer.setUpdateInterval(100)</code> e conecta o ouvinte. No cleanup, chama <code>subscriptionRef.current.remove()</code>, desligando o sensor físico imediatamente.
      </li>
      <li>
        <strong>Rastreamento GPS (<code>useLocationTracker.ts</code>):</strong> Inicia a escuta em <code>Location.watchPositionAsync</code> com precisão alta. No cleanup, cancela a assinatura nativa de satélite.
      </li>
    </ul>
  </div>

  <!-- PÁGINA 10: CATÁLOGO DE HOOKS (PARTE 2) - USEREF, USECALLBACK E EXPO -->
  <div class="page">
    <h2>4.3. Preservação de Alta Frequência com <code>useRef</code></h2>
    <p>
      Modificar a propriedade <code>ref.current</code> <strong>não causa re-renderização</strong> da tela. Esse padrão é essencial em aplicações com sensores de hardware para evitar sobrecarga de renderização a cada 100ms:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Referência</th>
          <th style="width: 25%;">Arquivo de Origem</th>
          <th style="width: 50%;">Por que utiliza useRef e não useState?</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>lastRepTimeRef</code></td>
          <td><code>useArmMotionTracker.ts</code></td>
          <td>Guarda o timestamp milissegundo da última rep para o debounce de 700ms. Evita renderizar a árvore React a cada milissegundo computado.</td>
        </tr>
        <tr>
          <td><code>repStateRef</code></td>
          <td><code>useArmMotionTracker.ts</code></td>
          <td>Armazena o estado interno da FSM (<code>esperando_pico</code> vs <code>esperando_vale</code>) sem causar repintura da interface a cada amostra intermediária.</td>
        </tr>
        <tr>
          <td><code>recentRepsTimestampsRef</code></td>
          <td><code>useArmMotionTracker.ts</code></td>
          <td>Vetor de timestamps das repetições recentes para o cálculo de cadência RPM.</td>
        </tr>
        <tr>
          <td><code>lastPointRef</code> &amp; <code>accumulatedDistanceRef</code></td>
          <td><code>useLocationTracker.ts</code></td>
          <td>Armazena a coordenada anterior e acumula a distância matemática de Haversine sem atrasos de ciclo de renderização.</td>
        </tr>
        <tr>
          <td><code>cameraRef</code></td>
          <td><code>src/app/camera.tsx</code></td>
          <td>Guarda a referência direta ao nó nativo <code>CameraView</code> para invocar imperativamente o método <code>takePictureAsync()</code>.</td>
        </tr>
      </tbody>
    </table>

    <h2>4.4. Estabilidade Referencial com <code>useCallback</code></h2>
    <p>
      O <code>useCallback</code> memoriza referências de funções passadas para botões e componentes filhos, prevenindo re-renderizações espúrias:
    </p>
    <ul>
      <li><code>start()</code>, <code>pause()</code>, <code>resume()</code> e <code>reset()</code> em <code>useWorkoutTimer</code>.</li>
      <li><code>resetReps()</code>, <code>addManualRep()</code> e <code>removeManualRep()</code> em <code>useArmMotionTracker</code>.</li>
      <li><code>requestPermission()</code> e <code>resetMetrics()</code> em <code>useLocationTracker</code>.</li>
      <li><code>loadSessions()</code> em <code>src/app/historico.tsx</code> para invocação segura no hook de foco.</li>
    </ul>

    <h2>4.5. Hooks Específicos do Expo e Expo Router</h2>
    <ul>
      <li>
        <strong><code>useRouter</code> (de <code>expo-router</code>):</strong> Provê despacho imperativo de rotas na pilha de navegação nativa. Exemplo: <code>router.push('/camera')</code> para transição até o visor fotográfico e <code>router.back()</code> para retornar ao treino.
      </li>
      <li>
        <strong><code>useFocusEffect</code> (de <code>expo-router</code>):</strong> Dispara uma ação sempre que a tela em questão se torna visível ao usuário. Utilizado na tela <code>historico.tsx</code> para recarregar a listagem de treinos do AsyncStorage assim que o atleta toca na aba de Histórico.
      </li>
      <li>
        <strong><code>useCameraPermissions</code> (de <code>expo-camera</code>):</strong> Hook oficial que gerencia o diálogo de autorização nativa de câmera no Android e iOS.
      </li>
    </ul>
  </div>

  <!-- PÁGINA 11: CAPÍTULO 5 - SERVIÇOS E PERSISTÊNCIA -->
  <div class="page">
    <h1><span class="h1-number">05</span> Catálogo de Serviços, Persistência Local e Tipagem TypeScript</h1>

    <p>
      Toda a computação matemática e o acesso a dados residem no diretório <code>src/services/</code>, mantendo a camada de visualização desacoplada de regras algorítmicas.
    </p>

    <h2>5.1. Módulo Geográfico e de Pacing (<code>src/services/locationService.ts</code>)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Função</th>
          <th style="width: 35%;">Assinatura e Tipos</th>
          <th style="width: 40%;">Comportamento e Retorno</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>calculateDistanceKm</code></td>
          <td><code>(lat1: number, lon1: number, lat2: number, lon2: number): number</code></td>
          <td>Aplica a trigonometria esférica de Haversine com o raio da Terra de 6.371 km. Retorna a distância percorrida em quilômetros.</td>
        </tr>
        <tr>
          <td><code>metersPerSecondToKmh</code></td>
          <td><code>(speedMps: number | null): number</code></td>
          <td>Multiplica a velocidade bruta em m/s pelo fator 3.6. Retorna a velocidade em km/h com 1 casa decimal (retorna 0 se nulo ou negativo).</td>
        </tr>
        <tr>
          <td><code>formatInstantPace</code></td>
          <td><code>(speedMps: number | null): string</code></td>
          <td>Converte velocidade em segundos/km (1000 / v) e formata como <code>MM'SS"</code>. Se a velocidade for menor que 0.5 m/s, retorna <code>--'--"</code>.</td>
        </tr>
        <tr>
          <td><code>formatAveragePace</code></td>
          <td><code>(totalSeconds: number, distanceKm: number): string</code></td>
          <td>Divide o tempo total decorrido em segundos pela distância percorrida em km. Retorna o ritmo médio ponderado no formato <code>MM'SS"</code>.</td>
        </tr>
        <tr>
          <td><code>formatDuration</code></td>
          <td><code>(totalSeconds: number): string</code></td>
          <td>Formata o total de segundos inteiros para o padrão legível de cronômetro: <code>MM:SS</code> (ou <code>HH:MM:SS</code> para treinos acima de 1 hora).</td>
        </tr>
      </tbody>
    </table>

    <h2>5.2. Módulo de Persistência Offline (<code>src/services/storage.ts</code>)</h2>
    <p>
      O armazenamento de treinos é <em>Offline-First</em>, gravando os dados no disco interno do smartphone sem necessidade de conexão de rede sob a chave <code>@app_pam:workouts_v1</code>:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Função</th>
          <th style="width: 35%;">Assinatura TypeScript</th>
          <th style="width: 40%;">Operação no AsyncStorage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>getWorkoutSessions</code></td>
          <td><code>(): Promise&lt;WorkoutSession[]&gt;</code></td>
          <td>Lê a chave local, desserializa o JSON e ordena o array decrescentemente pela data de início (treinos recentes primeiro). Retorna [] em falhas.</td>
        </tr>
        <tr>
          <td><code>saveWorkoutSession</code></td>
          <td><code>(session: WorkoutSession): Promise&lt;boolean&gt;</code></td>
          <td>Recupera a lista atual, insere a nova sessão no índice zero e serializa de volta em JSON. Retorna <code>true</code> em caso de sucesso.</td>
        </tr>
        <tr>
          <td><code>deleteWorkoutSession</code></td>
          <td><code>(id: string): Promise&lt;boolean&gt;</code></td>
          <td>Filtra o array excluindo a sessão com o ID especificado e grava o vetor atualizado em disco. Retorna booleano de confirmação.</td>
        </tr>
        <tr>
          <td><code>clearAllSessions</code></td>
          <td><code>(): Promise&lt;boolean&gt;</code></td>
          <td>Remove a chave completa do AsyncStorage via <code>removeItem</code>, zerando todo o histórico local com segurança.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PÁGINA 12: CONTRATOS DE DADOS TYPESCRIPT -->
  <div class="page">
    <h2>5.3. Contratos de Dados e Tipagem Estrita (<code>src/types/workout.ts</code>)</h2>
    <p>
      A integridade estrita entre os dados medidos pelos sensores e as entidades persistidas é assegurada por interfaces TypeScript consolidadas:
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0;">
      <pre style="margin: 0; font-size: 9.5px; line-height: 1.34;"><code>// 1. Telemetria Geodésica (GPS)
export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationMetrics {
  currentPace: string;
  averagePace: string;
  distanceKm: number;
  currentSpeedKmh: number;
  averageSpeedKmh: number;
  accuracyMeters: number | null;
  route: LocationPoint[];
}

// 2. Amostras de Hardware
export interface MotionSample {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}</code></pre>
      <pre style="margin: 0; font-size: 9.5px; line-height: 1.34;"><code>// 3. Métricas Biomecânicas
export interface ArmMotionMetrics {
  reps: number;
  cadenceRpm: number;
  intensityG: number;
  motionState: 'repouso' | 'subindo' | 'descendo';
  lastRepTimestamp: number | null;
}

// 4. Auditoria Fotográfica
export interface WorkoutPhoto {
  id: string;
  uri: string;
  timestamp: number;
  repsAtCapture: number;
  note?: string;
}

// 5. Sessão Consolidada em Disco
export interface WorkoutSession {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  totalReps: number;
  totalDistanceKm: number;
  averagePace: string;
  averageSpeedKmh: number;
  photos: WorkoutPhoto[];
  notes?: string;
}</code></pre>
    </div>

    <div class="callout callout-arch avoid-break">
      <div class="callout-title">🛡️ Vantagens da Tipagem Estrita no Ecossistema Mobile</div>
      <p>
        O uso de interfaces TypeScript completas assegura que nenhuma propriedade essencial (como <code>durationSeconds</code> ou <code>totalReps</code>) seja omitida no momento em que a sessão é serializada no AsyncStorage, evitando erros silenciosos de <em>undefined</em> durante a renderização no Histórico.
      </p>
    </div>
  </div>

  <!-- PÁGINA 13: CAPÍTULO 6 - HANDLERS DE INTERFACE E TELAS -->
  <div class="page">
    <h1><span class="h1-number">06</span> Handlers de Interface, Telas e Fluxo do Treino</h1>

    <p>
      As interações do atleta com a interface acionam funções manipuladoras (<em>handlers</em>) que coordenam os hooks de sensores e a camada de navegação.
    </p>

    <h2>6.1. Tela de Treino Ativo (<code>src/app/index.tsx</code>)</h2>
    <ul>
      <li>
        <strong><code>handleStartWorkout()</code>:</strong> Dispara <code>timer.start()</code>, reinicializa reps com <code>arm.resetReps()</code>, zera métricas com <code>location.resetMetrics()</code> e ativa os ouvintes dos sensores em background.
      </li>
      <li>
        <strong><code>handleNavigateToCamera()</code>:</strong> Invoca <code>router.push('/camera')</code>, permitindo ao atleta registrar fotografias de cargas sem interromper a contagem do cronômetro.
      </li>
      <li>
        <strong><code>handleOpenFinishModal()</code>:</strong> Pausa o cronômetro temporariamente com <code>timer.pause()</code> e exibe o modal de resumo com os totais de tempo, repetições, cadência e distância.
      </li>
      <li>
        <strong><code>handleConfirmSaveWorkout()</code>:</strong> Consolida os dados em uma instância de <code>WorkoutSession</code>, persiste no banco local com <code>saveWorkoutSession(newSession)</code>, reseta as métricas e exibe alerta de confirmação.
      </li>
      <li>
        <strong><code>handleCancelFinish()</code>:</strong> Fecha o modal de conclusão e retoma o cronômetro com <code>timer.resume()</code> caso o usuário decida continuar a série.
      </li>
      <li>
        <strong><code>handleDiscardWorkout()</code>:</strong> Fecha o modal e limpa todas as variáveis da sessão sem gravar nada no AsyncStorage.
      </li>
    </ul>

    <h2>6.2. Tela de Câmera de Séries (<code>src/app/camera.tsx</code>)</h2>
    <ul>
      <li>
        <strong><code>handleToggleFacing()</code>:</strong> Alterna a propriedade <code>facing</code> da câmera entre a lente traseira (<code>back</code>) e a frontal (<code>front</code>).
      </li>
      <li>
        <strong><code>handleToggleFlash()</code>:</strong> Alterna a lanterna de LED do aparelho (<code>enableTorch</code>) entre ligado e desligado.
      </li>
      <li>
        <strong><code>handleTakePicture()</code>:</strong> Invoca <code>cameraRef.current.takePictureAsync({ quality: 0.85 })</code>, bloqueia cliques múltiplos com <code>isCapturing = true</code>, salva o arquivo temporário e abre o preview de revisão.
      </li>
      <li>
        <strong><code>handleRetakePhoto()</code>:</strong> Descarta a foto recém-capturada e retorna ao visor ao vivo para nova tentativa.
      </li>
      <li>
        <strong><code>handleSavePhoto()</code>:</strong> Constrói o objeto <code>WorkoutPhoto</code> contendo o ID gerado, a URI da foto, a nota explicativa digitada pelo usuário e a quantidade de reps no instante do disparo, gravando os dados e redirecionando para <code>/historico</code>.
      </li>
    </ul>

    <h2>6.3. Tela de Histórico e Auditoria (<code>src/app/historico.tsx</code>)</h2>
    <ul>
      <li>
        <strong><code>loadSessions()</code>:</strong> Função assíncrona que lê as sessões ordenadas via <code>getWorkoutSessions()</code> e atualiza o estado local para renderização dos cards esportivos.
      </li>
      <li>
        <strong><code>handleDeleteSession(id: string)</code>:</strong> Exibe uma caixa de diálogo nativa de confirmação (<code>Alert.alert</code>) e, após aprovação do atleta, remove a sessão especificada via <code>deleteWorkoutSession(id)</code>.
      </li>
      <li>
        <strong><code>handleClearAll()</code>:</strong> Solicita confirmação explícita para remoção de todo o banco de histórico com <code>clearAllSessions()</code>.
      </li>
    </ul>
  </div>

  <!-- PÁGINA 14: DIAGRAMA INTEGRADO DO CICLO DE VIDA DO TREINO -->
  <div class="page">
    <h2>6.4. Diagrama Integrado do Ciclo de Vida da Sessão</h2>
    <p>
      O diagrama abaixo detalha a jornada de ponta a ponta da telemetria, desde o momento em que o smartphone é colocado na braçadeira até o arquivamento definitivo da sessão no histórico:
    </p>

    <div class="tree-container">
      <div><span class="tree-folder">[ ATLETA PRENDE CELULAR NA BRAÇADEIRA ]</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> ├──► </span><span class="tree-file">Toca em "INICIAR TREINO"</span></div>
      <div><span class="tree-branch"> │     │</span></div>
      <div><span class="tree-branch"> │     ├──► </span><span class="tree-comment">[ useWorkoutTimer ] Inicia contagem atômica de segundos (1 Hz)</span></div>
      <div><span class="tree-branch"> │     ├──► </span><span class="tree-comment">[ useArmMotionTracker ] Liga Acelerômetro (10 Hz) e monitora magnitude G</span></div>
      <div><span class="tree-branch"> │     └──► </span><span class="tree-comment">[ useLocationTracker ] Liga GPS contínuo e calcula Haversine/Pacing</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> ├──► </span><span class="tree-file">Durante o Treino (Concorrente)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Executa exercício: FSM detecta contração/extensão muscular (+1 Rep, Cadência RPM)</span></div>
      <div><span class="tree-branch"> │     ├── </span><span class="tree-comment">Corre ou caminha: GPS triangula coordenadas e converte para MM'SS"/km</span></div>
      <div><span class="tree-branch"> │     └── </span><span class="tree-comment">Audita carga: Toca em Câmera, fotografa anilhas com CameraView e adiciona notas</span></div>
      <div><span class="tree-branch"> │</span></div>
      <div><span class="tree-branch"> └──► </span><span class="tree-file">Toca em "FINALIZAR TREINO"</span></div>
      <div><span class="tree-branch">       │</span></div>
      <div><span class="tree-branch">       ├──► </span><span class="tree-comment">Modal de resumo exibe consolidação completa de estatísticas</span></div>
      <div><span class="tree-branch">       ├──► </span><span class="tree-comment">Confirmação: Serializa objeto WorkoutSession em JSON</span></div>
      <div><span class="tree-branch">       ├──► </span><span class="tree-comment">AsyncStorage: Grava na chave permanente '@app_pam:workouts_v1'</span></div>
      <div><span class="tree-branch">       └──► </span><span class="tree-comment">Aba Histórico: Recarrega via useFocusEffect e exibe card permanente</span></div>
    </div>

    <div class="callout callout-biomec avoid-break">
      <div class="callout-title">💡 Resiliência de Estado Durante o Treino</div>
      <p>
        Como o cronômetro e os listeners de aceleração e geolocalização utilizam <code>useRef</code> e subscrições desacopladas da tela, o atleta pode transitar livremente entre a visualização de braço e a visualização de pacing — e inclusive abrir o visor da câmera para fotografar uma anilha — sem que o cronômetro zere ou que repetições já contadas sejam perdidas.
      </p>
    </div>
  </div>

  <!-- PÁGINA 15: CAPÍTULO 7 - BOAS PRÁTICAS, TESTES E AVALIAÇÃO FATEC -->
  <div class="page">
    <h1><span class="h1-number">07</span> Boas Práticas, Mobile-First e Avaliação FATEC</h1>

    <p>
      Este capítulo sintetiza as diretrizes de engenharia de software mobile e os critérios acadêmicos aplicados no desenvolvimento do projeto <strong>PAM Fitness</strong> na disciplina de <strong>Programação de Aplicativos Mobile (PAM)</strong> da FATEC.
    </p>

    <h2>7.1. Gestão Energética e Eficiência de Bateria</h2>
    <ul>
      <li><strong>Desligamento Imediato de Sensores (Cleanup):</strong> Nenhum sensor permanece ativo em segundo plano quando o cronômetro não está em execução. Pausar ou finalizar cancela a assinatura de GPS e o listener do acelerômetro.</li>
      <li><strong>Amostragem Otimizada (100ms e 2m):</strong> O acelerômetro opera a 10 Hz (100ms), taxa ideal para a velocidade muscular humana que economiza até 70% de processamento em comparação a taxas de 60 Hz.</li>
      <li><strong>Dark Mode com Fundo Preto Verdadeiro (<code>#09090B</code>):</strong> Em telas OLED/AMOLED, os pixels pretos permanecem totalmente apagados, minimizando o consumo elétrico durante treinos prolongados.</li>
    </ul>

    <h2>7.2. Continuous Native Generation (CNG) e Expo SDK 57</h2>
    <ul>
      <li>As pastas <code>android/</code> e <code>ios/</code> <strong>não sofrem edições manuais</strong>; são geradas de forma reproduzível a partir do manifesto <code>app.json</code> e de config plugins oficiais.</li>
      <li>Todas as permissões nativas de hardware — como <code>ACCESS_FINE_LOCATION</code> e <code>CAMERA</code> — são declaradas formalmente no <code>app.json</code> com mensagens justificativas transparentes ao usuário.</li>
      <li>Arquitetura moderna com <strong>React Native 0.86</strong> e <strong>React 19</strong>, aproveitando o compilador otimizado e TypeScript estrito.</li>
    </ul>

    <h2>7.3. Checklist para Demonstração e Verificação Técnica</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 30%;">Item de Demonstração</th>
          <th style="width: 40%;">Procedimento de Teste no Smartphone</th>
          <th style="width: 30%;">Critério de Sucesso Esperado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Acelerômetro e Reps</strong></td>
          <td>Prender o celular no braço e executar 5 repetições de rosca bíceps com ritmo controlado.</td>
          <td>Contador atinge exatamente 5 repetições com transições "subindo", "descendo" e "repouso".</td>
        </tr>
        <tr>
          <td><strong>2. Filtragem de Ruído (Debounce)</strong></td>
          <td>Sacudir o braço rapidamente ou efetuar pequenos tremores musculares em menos de 700ms.</td>
          <td>O contador rejeita tremores e não incrementa repetições falsas.</td>
        </tr>
        <tr>
          <td><strong>3. GPS e Ritmo de Pacing</strong></td>
          <td>Caminhar ou correr em área aberta com sinal de satélite ativo.</td>
          <td>Velocidade calculada em km/h e pacing formatado em <code>MM'SS" /km</code>.</td>
        </tr>
        <tr>
          <td><strong>4. Captura de Câmera e Nota</strong></td>
          <td>Acessar a aba da câmera, fotografar um halter, digitar a anotação da série e salvar.</td>
          <td>Foto armazenada com nota e exibida na galeria da sessão no Histórico.</td>
        </tr>
        <tr>
          <td><strong>5. Persistência Offline</strong></td>
          <td>Fechar o app no multitarefa do sistema operacional e reabri-lo.</td>
          <td>Todas as sessões e fotos salvas permanecem íntegras no AsyncStorage.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-arch avoid-break" style="margin-top: 15px;">
      <div class="callout-title">🎓 Conclusão e Avaliação Acadêmica</div>
      <p>
        O <strong>PAM Fitness</strong> demonstra a aplicação prática dos conceitos fundamentais da disciplina: integração com APIs de sensores nativos de hardware, gerenciamento determinístico de ciclo de vida com React Hooks, arquitetura limpa com tipagem estrita em TypeScript, design system atlético mobile-first e persistência offline.
      </p>
    </div>
  </div>

</body>
</html>
"""

def generate_pdf():
    workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    docs_dir = os.path.join(workspace, 'docs')
    os.makedirs(docs_dir, exist_ok=True)

    html_path = os.path.join(docs_dir, 'documentacao_temp.html')
    raw_pdf_path = os.path.join(docs_dir, 'raw_documentacao.pdf')
    final_pdf_path = os.path.join(docs_dir, 'PAM_Fitness_Documentacao_Completa.pdf')

    html_content = build_html()
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[OK] HTML temporário gerado em: {html_path}")

    # Localização do binário do Chrome ou Edge
    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

    browser_bin = chrome_path if os.path.exists(chrome_path) else edge_path
    if not os.path.exists(browser_bin):
        raise FileNotFoundError("Nenhum navegador (Chrome ou Edge) encontrado para renderização do PDF.")

    print(f"[INFO] Renderizando PDF via: {browser_bin}")
    cmd = [
        browser_bin,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--no-pdf-header-footer',
        f'--print-to-pdf={raw_pdf_path}',
        html_path
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0 or not os.path.exists(raw_pdf_path):
        print("Tentando Edge se disponível...")
        if os.path.exists(edge_path) and browser_bin != edge_path:
            cmd[0] = edge_path
            res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0 or not os.path.exists(raw_pdf_path):
            raise RuntimeError(f"Falha ao gerar PDF bruto: {res.stderr}")

    print(f"[OK] PDF bruto gerado com sucesso ({os.path.getsize(raw_pdf_path)} bytes).")

    # Pós-processamento com PyMuPDF: cabeçalho, rodapé e árvore de bookmarks (TOC)
    doc = pymupdf.open(raw_pdf_path)
    total_pages = len(doc)
    print(f"[INFO] Total de páginas identificadas: {total_pages}")

    # Inserção de cabeçalho e rodapé em páginas após a capa (página index 0 é capa)
    for idx in range(1, total_pages):
        page = doc[idx]
        rect = page.rect
        page_num = idx + 1

        # Cabeçalho sutil
        header_left = "PAM Fitness • Manual de Engenharia e Especificação Técnica"
        header_right = "Fatec PAM — Expo SDK 57"
        page.insert_text(
            (40, 28),
            header_left,
            fontsize=8,
            fontname="helv",
            color=(0.4, 0.45, 0.5)
        )
        page.insert_text(
            (rect.width - 150, 28),
            header_right,
            fontsize=8,
            fontname="helv",
            color=(0.4, 0.45, 0.5)
        )
        # Linha divisória sutil no cabeçalho
        page.draw_line(
            pymupdf.Point(40, 33),
            pymupdf.Point(rect.width - 40, 33),
            color=(0.88, 0.9, 0.93),
            width=0.75
        )

        # Rodapé com numeração de páginas
        footer_left = "Fatec — Programação de Aplicativos Mobile | Documentação de Arquitetura"
        footer_right = f"Página {page_num} de {total_pages}"
        
        page.draw_line(
            pymupdf.Point(40, rect.height - 35),
            pymupdf.Point(rect.width - 40, rect.height - 35),
            color=(0.88, 0.9, 0.93),
            width=0.75
        )
        page.insert_text(
            (40, rect.height - 22),
            footer_left,
            fontsize=8,
            fontname="helv",
            color=(0.4, 0.45, 0.5)
        )
        page.insert_text(
            (rect.width - 110, rect.height - 22),
            footer_right,
            fontsize=8.5,
            fontname="helv",
            color=(0.1, 0.15, 0.25)
        )

    # Configuração dos Bookmarks nativos do PDF (Estrutura de Árvore no leitor de PDF)
    # Formato do PyMuPDF TOC: [level, title, page_number (1-indexed)]
    toc = [
        [1, "Capa do Projeto", 1],
        [1, "Sumário Executivo e Índice Geral", 2],
        [1, "1. Visão Geral, Arquitetura e Escopo do Sistema", 3],
        [2, "1.1 Proposta de Valor e Smartphone no Braço", 3],
        [2, "1.2 Casos de Uso Primários", 3],
        [2, "1.3 Identidade Visual e Dark Mode Atlântico", 3],
        [1, "2. Estruturas de Árvore e Mapeamento Arquitetural", 4],
        [2, "2.1 Árvore de Diretórios e Arquivos do Projeto", 4],
        [2, "2.2 Árvore de Navegação (Expo Router)", 5],
        [2, "2.3 Árvore de Fluxo de Dados e Camadas de Estado", 5],
        [1, "3. Engenharia e Física dos Sensores de Hardware", 6],
        [2, "3.1 Sensor de Movimento (Acelerômetro) & Magnitude Euclidiana", 6],
        [2, "3.2 Máquina de Estados Finita (FSM), Debounce e Cadência", 7],
        [2, "3.3 Sensor de GPS (Haversine e Pacing) & Câmera", 8],
        [1, "4. Catálogo Detalhado de Hooks e Funções React / Expo", 9],
        [2, "4.1 Hooks Nativos do React (useState, useEffect)", 9],
        [2, "4.2 useRef, useCallback e Hooks do Expo", 10],
        [1, "5. Catálogo de Serviços, Persistência Local e Tipagem TypeScript", 11],
        [2, "5.1 Módulo Geográfico e Persistência Offline", 11],
        [2, "5.2 Contratos de Dados TypeScript (workout.ts)", 12],
        [1, "6. Handlers de Interface, Telas e Fluxo do Treino", 13],
        [2, "6.1 Handlers das Telas (Treino, Câmera, Histórico)", 13],
        [2, "6.2 Diagrama Integrado do Ciclo de Vida da Sessão", 14],
        [1, "7. Boas Práticas, Mobile-First e Avaliação FATEC", 15],
        [2, "7.1 Gestão Energética, CNG e Checklist Técnico", 15],
    ]

    doc.set_toc(toc)

    # Salva documento final otimizado
    doc.save(final_pdf_path, deflate=True)
    doc.close()

    # Limpeza de arquivos intermediários
    if os.path.exists(html_path):
        os.remove(html_path)
    if os.path.exists(raw_pdf_path):
        os.remove(raw_pdf_path)

    print(f"\n[SUCESSO] Documento PDF completo gerado em:\n==> {final_pdf_path}")
    print(f"Tamanho final: {os.path.getsize(final_pdf_path):,} bytes | Total de páginas: {total_pages}")

if __name__ == "__main__":
    generate_pdf()
