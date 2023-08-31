import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import SubHeader from '../../../common/js/components/SubHeader';
import GfwButton from '../../../common/js/components/GfwButton';
import '../../css/select.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organization: {},
      selected: 0,
    };

    if (props.organizations.length === 1) {
      const [organization] = props.organizations;
      this.autoSubmit(organization);
    }
  }

  createAccountsList = (account) => {
    const inactive =
      account.organization_status_id === 3 || account.organization_user_status_id === 3
        ? true
        : false;

    if (inactive) {
      return (
        <tr key={account.organization_id}>
          <td className="disabled-table-link" key={account.organization_id}>
            {account.organization_name}
          </td>
        </tr>
      );
    } else {
      return (
        <tr key={account.organization_id}>
          <td
            className={this.isActive(account.organization_id)}
            key={account.organization_id}
            onClick={this.selectOrg}
          >
            {account.organization_name}
          </td>
        </tr>
      );
    }
  };

  isActive = (val) => {
    return 'select-table-link' + (val === this.state.selected ? ' active' : '');
  };

  selectOrg = (evt) => {
    let selectedOrg;
    this.props.organizations.forEach((org) => {
      if (evt.target.innerHTML === org.organization_name) {
        selectedOrg = org;
      }
    });
    if (selectedOrg) {
      this.setState({
        organization: selectedOrg,
        selected: selectedOrg.organization_id,
      });
    }
  };

  autoSubmit = (organization) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      console.log('request', request);
      if (request.responseText === 'Locations') {
        window.location.href = '/locations';
      } else {
        console.log('Wrong route');
      }
    };
    request.onerror = (err) => {
      console.log(`Error: ${err}`);
    };
    request.open('POST', '/select/org', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send(
      `org_id=${organization.organization_id}&org_db=${organization.organization_db}&org_user_id=${organization.organization_user_id}&org_status_id=${organization.organization_status_id}&subscription_status_id=${organization.subscription_status_id}&org_activated_time=${organization.organization_activated_time}`
    );
  };

  submit = () => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      console.log('request', request);
      if (request.responseText === 'Locations') {
        window.location.href = '/locations';
      } else {
        console.log('Wrong route');
      }
    };
    request.onerror = (err) => {
      console.log(`Error: ${err}`);
    };
    request.open('POST', '/select/org', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send(
      `org_id=${this.state.organization.organization_id}&org_db=${this.state.organization.organization_db}&org_user_id=${this.state.organization.organization_user_id}&org_status_id=${this.state.organization.organization_status_id}&subscription_status_id=${this.state.organization.subscription_status_id}&org_activated_time=${this.state.organization.organization_activated_time}`
    );
  };

  render() {
    const accountsList = this.props.organizations.map(this.createAccountsList);

    return (
      <Page links={pageOptions.links} active="select">
        <SubHeader header="Select Organization" />
        <div className="profile-body">
          <h2 className="section-title-large">Select which organization you would like to view:</h2>
          <table>
            <thead>
              <tr>
                <th>Organization Name</th>
              </tr>
            </thead>
            <tbody>{accountsList}</tbody>
          </table>
          <div className="buttons-container">
            <GfwButton classNames="btn-green" onClick={this.submit} value="Submit" />
          </div>
        </div>
      </Page>
    );
  }
}
