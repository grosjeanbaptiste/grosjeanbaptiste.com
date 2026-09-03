"""Compile targets for the .grosjean DSL. Each module exposes a
single ``emit(resume: nodes.Resume) -> dict``  entry-point that
returns the JSON-serialisable payload for its output.
"""
