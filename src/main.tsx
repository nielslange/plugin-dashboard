import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './Dashboard';
import './index.scss';

ReactDOM.createRoot( document.getElementById( 'root' ) as HTMLElement ).render(
	<React.StrictMode>
		<Dashboard />
	</React.StrictMode>
);
