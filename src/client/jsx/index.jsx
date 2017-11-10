import React from 'react'
import {render} from 'react-dom'

class App extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			authenticated: false,
			user: {}
		}

		fetch("/auth/status", {credentials: "include"}).then((response) => {
			return response.json()
		}).then((status) => {
			if(status.authenticated === true) {
				this.setState({
					authenticated: true,
					user: status.user
				})
			}
		})
	}

	render() {
		return ([
			<Sidebar authed={this.state.authenticated} user={this.state.user} />,
			<Timeline />
		])
	}
}

class Sidebar extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (<div id="sidebar">
			<div id="sidebar-auth">
				{this.props.authed ?
					(<p>{this.props.user.handle} | <a href="/auth/logout">Log out</a></p>)
					:
					(<a href="/auth/twitter">Log in</a>)
				}
			</div>
		</div>)
	}
}

class Timeline extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return(<div id="timeline"></div>)
	}
}

render(<App/>, document.getElementById('app'))
