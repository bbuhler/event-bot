export default function ({ users_shared, contact }) {
  if (users_shared) {
    const [{ user_id, ...user }] = users_shared.users;
    return {
      id: user_id,
      ...user,
    };
  }

  if (contact) {
    return {
      id: contact.user_id,
      ...contact,
    };
  }
}