"""Parsing/validation for query filters and new sighting submissions."""
from datetime import date, datetime, timedelta

from reference import SPECIES, normalise_city, normalise_species

NOTES_MAX = 500
DATETIME_FORMATS = ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d")


class ValidationError(Exception):
    """Raised with a dict of {field: message} for 400 responses."""

    def __init__(self, errors):
        super().__init__("Validation failed")
        self.errors = errors


def parse_datetime(value):
    """Parse the ISO forms we accept; returns datetime or None."""
    if not isinstance(value, str):
        return None
    value = value.strip()
    for fmt in DATETIME_FORMATS:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def parse_filters(args):
    """Validate ?start=&end=&city=&species= (dates as YYYY-MM-DD, end inclusive)."""
    errors, filters = {}, {}

    for key in ("start", "end"):
        raw = args.get(key)
        if raw:
            try:
                parsed = date.fromisoformat(raw)
            except ValueError:
                errors[key] = "Must be a date in YYYY-MM-DD format."
                continue
            if key == "end":
                parsed += timedelta(days=1)  # make the end date inclusive
            filters[key] = parsed.isoformat()

    if "start" in filters and "end" in filters and filters["start"] >= filters["end"]:
        errors["end"] = "End date must be on or after start date."

    if args.get("city"):
        city = normalise_city(args["city"])
        if city:
            filters["city"] = city
        else:
            errors["city"] = "Unknown city."

    if args.get("species"):
        species = normalise_species(args["species"])
        if species:
            filters["species"] = species
        else:
            errors["species"] = "Unknown species."

    if errors:
        raise ValidationError(errors)
    return filters


def parse_int(args, key, default, minimum, maximum):
    raw = args.get(key)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError:
        raise ValidationError({key: "Must be a whole number."})
    if not minimum <= value <= maximum:
        raise ValidationError({key: f"Must be between {minimum} and {maximum}."})
    return value


def validate_submission(payload, now=None):
    """Validate a new report. Returns a clean dict ready for the database."""
    if not isinstance(payload, dict):
        raise ValidationError({"body": "Request body must be a JSON object."})

    now = now or datetime.now()
    errors = {}

    when = parse_datetime(payload.get("date"))
    if not payload.get("date"):
        errors["date"] = "Date is required."
    elif when is None:
        errors["date"] = "Date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM format."
    elif when > now:
        errors["date"] = "Date cannot be in the future."

    city = normalise_city(payload.get("location"))
    if not payload.get("location"):
        errors["location"] = "Location is required."
    elif city is None:
        errors["location"] = "Please choose one of the listed cities."

    species = normalise_species(payload.get("species"))
    if not payload.get("species"):
        errors["species"] = "Species is required."
    elif species is None:
        errors["species"] = "Please choose one of the listed species."

    notes = payload.get("notes") or ""
    if not isinstance(notes, str):
        errors["notes"] = "Notes must be text."
    elif len(notes.strip()) > NOTES_MAX:
        errors["notes"] = f"Notes must be {NOTES_MAX} characters or fewer."

    if errors:
        raise ValidationError(errors)

    return {
        "date": when.strftime("%Y-%m-%dT%H:%M:%S"),
        "location": city,
        "species": species,
        "latin_name": SPECIES[species],
        "notes": notes.strip() or None,
    }
