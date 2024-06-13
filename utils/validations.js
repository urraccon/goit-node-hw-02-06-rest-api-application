export function allFieldsRequired(body) {
  if (!body?.name || !body?.email || !body?.phone) {
    return false;
  }

  return true;
}

export function oneFieldRequired(body) {
  if (body?.name || body?.email || body?.phone) {
    return true;
  }

  return false;
}

export function favoriteFieldRequired(body) {
  if (body?.favorite) {
    return true;
  }

  return false;
}
