exports.invitationMapper = (data, currentOrganizationId) => {
  const mappedData = data.map((invitation) => {
    return {
      ...invitation,
      isCurrentOrganization: invitation.idSourceOrganization === currentOrganizationId,
    };
  });

  return mappedData;
}