"""Fixed reference data.

The Elanco API only gives a city name, so we map each known city to approximate
coordinates (city centre) for the map. Species -> Latin name comes from the source data.
"""

CITIES = {
    "Birmingham": (52.4862, -1.8904),
    "Bristol": (51.4545, -2.5879),
    "Cardiff": (51.4816, -3.1791),
    "Edinburgh": (55.9533, -3.1883),
    "Glasgow": (55.8642, -4.2518),
    "Leeds": (53.8008, -1.5491),
    "Leicester": (52.6369, -1.1398),
    "Liverpool": (53.4084, -2.9916),
    "London": (51.5072, -0.1276),
    "Manchester": (53.4808, -2.2426),
    "Newcastle": (54.9783, -1.6178),
    "Nottingham": (52.9548, -1.1581),
    "Sheffield": (53.3811, -1.4701),
    "Southampton": (50.9097, -1.4044),
}

SPECIES = {
    "Fox/badger tick": "Ixodes canisuga",
    "Marsh tick": "Ixodes apronophorus",
    "Passerine tick": "Dermacentor frontalis",
    "Southern rodent tick": "Ixodes acuminatus",
    "Tree-hole tick": "Ixodes arboricola",
}


def _lookup(value, options):
    """Case/whitespace-insensitive match against a set of canonical names."""
    if not isinstance(value, str):
        return None
    wanted = value.strip().lower()
    for name in options:
        if name.lower() == wanted:
            return name
    return None


def normalise_city(value):
    return _lookup(value, CITIES)


def normalise_species(value):
    return _lookup(value, SPECIES)
