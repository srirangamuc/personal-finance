"""
Logger configs for the project

Author: Srirangam Umesh Chandra
Created on: 2025-07-31
"""

import logging

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s")
        ch.setFormatter(formatter)
        logger.addHandler(ch)

    return logger