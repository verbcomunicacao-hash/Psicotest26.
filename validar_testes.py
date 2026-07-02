#!/usr/bin/env python3
"""
validar_testes.py

Script para validar a integridade de arquivos JSON de testes psicométricos.
Verifica:
  - Se o arquivo existe
  - Se é um JSON válido
  - Se possui os campos obrigatórios: id, titulo, perguntas, opcoes, pesos

Uso:
  python validar_testes.py arquivo1.json [arquivo2.json ...]
"""

import json
import os
import sys
from typing import Any, Dict, List, Tuple

CAMPOS_OBRIGATORIOS = ["id", "titulo", "perguntas", "opcoes", "pesos"]


def arquivo_existe(caminho: str) -> bool:
    """Verifica se o arquivo existe no caminho informado."""
    return os.path.isfile(caminho)


def carregar_json(caminho: str) -> Tuple[Any, str]:
    """Tenta carregar e interpretar o conteúdo do arquivo como JSON."""
    try:
        with open(caminho, "r", encoding="utf-8") as arquivo:
            return json.load(arquivo), ""
    except json.JSONDecodeError as erro:
        return None, f"JSON inválido: {erro}"
    except OSError as erro:
        return None, f"Erro ao ler o arquivo: {erro}"


def validar_campos(dados: Any) -> List[str]:
    """Valida se os campos obrigatórios estão presentes e não vazios."""
    erros: List[str] = []

    if not isinstance(dados, dict):
        erros.append("O conteúdo do JSON deve ser um objeto (dicionário).")
        return erros

    for campo in CAMPOS_OBRIGATORIOS:
        if campo not in dados:
            erros.append(f"Campo obrigatório ausente: '{campo}'.")
            continue

        valor = dados[campo]
        if valor is None:
            erros.append(f"Campo obrigatório nulo: '{campo}'.")
        elif isinstance(valor, str) and valor.strip() == "":
            erros.append(f"Campo obrigatório vazio: '{campo}'.")
        elif isinstance(valor, (list, dict)) and len(valor) == 0:
            erros.append(f"Campo obrigatório vazio: '{campo}'.")

    # Validações adicionais de consistência básica
    if isinstance(dados, dict):
        perguntas = dados.get("perguntas")
        opcoes = dados.get("opcoes")
        pesos = dados.get("pesos")

        if isinstance(perguntas, list) and isinstance(opcoes, list):
            if len(perguntas) != len(opcoes):
                erros.append(
                    "A quantidade de 'perguntas' difere da quantidade de 'opcoes'."
                )

        if isinstance(perguntas, list) and isinstance(pesos, list):
            if len(perguntas) != len(pesos):
                erros.append(
                    "A quantidade de 'perguntas' difere da quantidade de 'pesos'."
                )

    return erros


def validar_arquivo(caminho: str) -> Tuple[bool, List[str]]:
    """Executa todas as validações para um arquivo de teste psicométrico."""
    erros: List[str] = []

    if not arquivo_existe(caminho):
        erros.append(f"O arquivo não existe: {caminho}")
        return False, erros

    dados, erro_leitura = carregar_json(caminho)
    if erro_leitura:
        erros.append(erro_leitura)
        return False, erros

    erros.extend(validar_campos(dados))
    return len(erros) == 0, erros


def imprimir_relatorio(caminho: str, sucesso: bool, erros: List[str]) -> None:
    """Imprime o relatório de validação para um arquivo."""
    print("=" * 60)
    print(f"Arquivo: {caminho}")
    print("=" * 60)

    if sucesso:
        print("Status: SUCESSO")
        print("O arquivo é válido e possui todos os campos obrigatórios.")
    else:
        print("Status: FALHA")
        print("Erros encontrados:")
        for indice, erro in enumerate(erros, start=1):
            print(f"  {indice}. {erro}")

    print("=" * 60)
    print()


def main(argumentos: List[str]) -> int:
    """Função principal do script."""
    if len(argumentos) < 2:
        print("Uso: python validar_testes.py arquivo1.json [arquivo2.json ...]")
        return 1

    arquivos = argumentos[1:]
    todos_validos = True

    for caminho in arquivos:
        sucesso, erros = validar_arquivo(caminho)
        imprimir_relatorio(caminho, sucesso, erros)
        if not sucesso:
            todos_validos = False

    if todos_validos:
        print("Todos os arquivos validados com sucesso.")
        return 0

    print("Um ou mais arquivos apresentaram erros de validação.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
