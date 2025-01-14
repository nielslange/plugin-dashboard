import { useState, useEffect } from 'react';
import { Card } from './Card';

interface Plugin {
	name: string;
	active_installs: number;
	downloaded: number;
	rating: number;
	num_ratings: number;
	requires: string;
	requires_php: string;
	tested: string;
	version: string;
	slug: string;
}

export const Dashboard = () => {
	const [ data, setData ] = useState< Plugin[] | null >( null );
	const [ downloads, setDownloads ] = useState( 0 );
	const [ installs, setInstalls ] = useState( 0 );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	const [ searchField, setSearchField ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'searchField' ) || 'SMNTCS';
	} );

	const [ sortField, setSortField ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'sortField' ) || 'downloads';
	} );

	const [ sortOrder, setSortOrder ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'sortOrder' ) || 'desc';
	} );

	const [ showActiveInstalls, setShowActiveInstalls ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showActiveInstalls' ) === 'false' ? false : true;
	} );

	const [ showDownloads, setShowDownloads ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showDownloads' ) === 'false' ? false : true;
	} );

	const [ showNumberOfRatings, setShowNumberOfRatings ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showNumberOfRatings' ) === 'false' ? false : true;
	} );

	const [ showRating, setShowRating ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showRating' ) === 'false' ? false : true;
	} );

	const [ showRequiresAtLeast, setShowRequiresAtLeast ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showRequiresAtLeast' ) === 'false' ? false : true;
	} );

	const [ showRequiresPHP, setShowRequiresPHP ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showRequiresPHP' ) === 'false' ? false : true;
	} );

	const [ showTestedUpTo, setShowTestedUpTo ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showTestedUpTo' ) === 'false' ? false : true;
	} );

	const [ showVersion, setShowVersion ] = useState( () => {
		const params = new URLSearchParams( window.location.search );
		return params.get( 'showVersion' ) === 'false' ? false : true;
	} );

	const sortOptions = [
		{
			key: 'activeInstalls',
			label: 'Active Installs',
			visible: showActiveInstalls,
		},
		{ key: 'downloads', label: 'Downloads', visible: showDownloads },
		{
			key: 'numberOfRatings',
			label: 'Number of Ratings',
			visible: showNumberOfRatings,
		},
		{ key: 'pluginName', label: 'Plugin Name', visible: true }, // Always visible
		{ key: 'rating', label: 'Rating', visible: showRating },
		{
			key: 'requiresAtLeast',
			label: 'Required WordPress Version',
			visible: showRequiresAtLeast,
		},
		{
			key: 'requiresPHP',
			label: 'Required PHP Version',
			visible: showRequiresPHP,
		},
		{ key: 'testedUpTo', label: 'Tested Up To', visible: showTestedUpTo },
		{ key: 'version', label: 'Version', visible: showVersion },
	];

	const visibleSortOptions = sortOptions.filter(
		( option ) => option.visible
	);

	const dynamicSort = ( field: any, sortOrder = 'asc' ) => {
		return function ( a: any, b: any ) {
			let result = 0;
			if ( field === 'pluginName' || field === 'version' ) {
				result = a[ field ].localeCompare( b[ field ] );
			} else {
				result = parseFloat( a[ field ] ) - parseFloat( b[ field ] );
			}
			return sortOrder === 'desc' ? -result : result;
		};
	};

	let url = new URL( 'https://api.wordpress.org/plugins/info/1.2/' );
	url.searchParams.append( 'action', 'query_plugins' );
	url.searchParams.append( 'request[fields][banners]', 'true' );
	url.searchParams.append( 'request[search]', searchField );

	let plugins;
	let downloadCount = 0;
	let installCount = 0;

	useEffect( () => {
		fetch( url )
			.then( ( response ) => {
				if ( ! response.ok ) {
					throw new Error(
						`HTTP error: The status is ${ response.status }`
					);
				}
				return response.json();
			} )
			.then( ( data ) => {
				plugins = data[ 'plugins' ];
				const sortKeyMap: { [ key: string ]: string } = {
					activeInstalls: 'active_installs',
					downloads: 'downloaded',
					testedUpTo: 'tested',
					pluginName: 'name',
					rating: 'rating',
					numberOfRatings: 'num_ratings',
					requiresAtLeast: 'requires',
					requiresPHP: 'requires_php',
					version: 'version',
				};

				plugins.sort(
					dynamicSort( sortKeyMap[ sortField ], sortOrder )
				);

				plugins.forEach( ( plugin: Plugin ) => {
					downloadCount += plugin.downloaded;
					installCount += plugin.active_installs;
				} );

				setData( plugins );
				setDownloads( downloadCount );
				setInstalls( installCount );
				setError( null );
			} )
			.catch( ( err ) => {
				setError( err.message );
				setData( null );
			} )
			.finally( () => {
				setLoading( false );
			} );
	}, [ searchField, sortField, sortOrder ] );

	useEffect( () => {
		if (
			! visibleSortOptions.find( ( option ) => option.key === sortField )
		) {
			setSortField( visibleSortOptions[ 0 ].key );
		}
	}, [
		showActiveInstalls,
		showDownloads,
		showNumberOfRatings,
		showRating,
		showRequiresAtLeast,
		showRequiresPHP,
		showTestedUpTo,
	] );

	const handleSearch = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const newSearchField = e.target.value;
		setSearchField( newSearchField );

		const params = new URLSearchParams( window.location.search );
		params.set( 'searchField', newSearchField );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const handleSortField = ( e: React.ChangeEvent< HTMLSelectElement > ) => {
		const newSortField = e.target.value;
		setSortField( newSortField );

		const params = new URLSearchParams( window.location.search );
		params.set( 'sortField', newSortField );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const handleSortOrder = ( e: React.ChangeEvent< HTMLSelectElement > ) => {
		const newSortOrder = e.target.value;
		setSortOrder( newSortOrder );

		const params = new URLSearchParams( window.location.search );
		params.set( 'sortOrder', newSortOrder );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleActiveInstalls = () => {
		const currentSetting = ! showActiveInstalls;
		setShowActiveInstalls( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showActiveInstalls', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleDownloads = () => {
		const currentSetting = ! showDownloads;
		setShowDownloads( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showDownloads', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleNumberOfRatings = () => {
		const currentSetting = ! showNumberOfRatings;
		setShowNumberOfRatings( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showNumberOfRatings', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleRating = () => {
		const currentSetting = ! showRating;
		setShowRating( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showRating', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleRequiresAtLeast = () => {
		const currentSetting = ! showRequiresAtLeast;
		setShowRequiresAtLeast( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showRequiresAtLeast', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleRequiresPHP = () => {
		const currentSetting = ! showRequiresPHP;
		setShowRequiresPHP( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showRequiresPHP', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleTestedUpTo = () => {
		const currentSetting = ! showTestedUpTo;
		setShowTestedUpTo( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showTestedUpTo', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	const toggleVersion = () => {
		const currentSetting = ! showVersion;
		setShowVersion( currentSetting );

		const params = new URLSearchParams( window.location.search );
		params.set( 'showVersion', currentSetting.toString() );
		window.history.replaceState(
			{},
			'',
			`${ window.location.pathname }?${ params }`
		);
	};

	console.log( { sortField } );

	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col-md-3 col-xl-3 col-xxl-2 col-12 m-0 p-0">
					<div className="text-bg-dark p-4 vh-100 sticky-top">
						<h3>WP Plugin Dashboard</h3>

						{ loading && <p>Loading...</p> }
						{ error && (
							<div>{ `There is a problem fetching the post data - ${ error }` }</div>
						) }
						{ data && (
							<>
								<p className="lead">
									The following { data.length } plugins have
									been downloaded{ ' ' }
									<strong>
										{ downloads.toLocaleString() }
									</strong>{ ' ' }
									and installed{ ' ' }
									<strong>
										{ installs.toLocaleString() }
									</strong>{ ' ' }
									times.
								</p>

								<form>
									<p>
										<label
											htmlFor="search"
											className="form-label"
										>
											Search for
										</label>
										<input
											className="form-control"
											type="text"
											name="search"
											id="search"
											placeholder="plugin slug"
											onChange={ handleSearch }
											value={ searchField }
										/>
									</p>
									<p>
										<label
											htmlFor="sortField"
											className="form-label"
										>
											Sort by
										</label>
										<select
											className="form-select"
											aria-label="Select sort field"
											name="sortField"
											onChange={ handleSortField }
											value={ sortField }
										>
											{ visibleSortOptions.map(
												( option ) => (
													<option
														key={ option.key }
														value={ option.key }
													>
														{ option.label }
													</option>
												)
											) }
										</select>
									</p>
									<p>
										<select
											className="form-select"
											aria-label="Select sort order"
											name="sortOrder"
											onChange={ handleSortOrder }
											value={ sortOrder }
										>
											<option value="desc">↓ desc</option>
											<option value="asc">↑ asc</option>
										</select>
									</p>
								</form>

								<div>
									<label
										htmlFor="sortField"
										className="form-label"
									>
										Show / hide fields
									</label>

									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="activeInstalls"
											name="activeInstalls"
											checked={ showActiveInstalls }
											onChange={ toggleActiveInstalls }
										/>
										<label
											className="form-check-label"
											htmlFor="activeInstalls"
										>
											Active installs
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="downloads"
											name="downloads"
											checked={ showDownloads }
											onChange={ toggleDownloads }
										/>
										<label
											className="form-check-label"
											htmlFor="downloads"
										>
											Downloads
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="numberOfRatings"
											name="numberOfRatings"
											checked={ showNumberOfRatings }
											onChange={ toggleNumberOfRatings }
										/>
										<label
											className="form-check-label"
											htmlFor="numberOfRatings"
										>
											Number of ratings
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="rating"
											name="rating"
											checked={ showRating }
											onChange={ toggleRating }
										/>
										<label
											className="form-check-label"
											htmlFor="rating"
										>
											Rating
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="requiresAtLeast"
											name="requiresAtLeast"
											checked={ showRequiresAtLeast }
											onChange={ toggleRequiresAtLeast }
										/>
										<label
											className="form-check-label"
											htmlFor="requiresAtLeast"
										>
											Requires at least
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="requiresPHP"
											name="requiresPHP"
											checked={ showRequiresPHP }
											onChange={ toggleRequiresPHP }
										/>
										<label
											className="form-check-label"
											htmlFor="requiresPHP"
										>
											Requires PHP
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="testedUpTo"
											name="testedUpTo"
											checked={ showTestedUpTo }
											onChange={ toggleTestedUpTo }
										/>
										<label
											className="form-check-label"
											htmlFor="testedUpTo"
										>
											Tested up to
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="version"
											name="version"
											checked={ showVersion }
											onChange={ toggleVersion }
										/>
										<label
											className="form-check-label"
											htmlFor="version"
										>
											Version
										</label>
									</div>
								</div>
							</>
						) }
					</div>
				</div>

				<div className="col-md-9 col-xl-9 col-xxl-10 col-12 m-0 p-0">
					{ data && (
						<div className="container-fluid">
							<div className="row m-0">
								{ data.map( ( plugin: any ) => (
									<Card
										plugin={ plugin }
										key={ plugin.slug }
										showActiveInstalls={
											showActiveInstalls
										}
										showDownloads={ showDownloads }
										showNumberOfRatings={
											showNumberOfRatings
										}
										showRating={ showRating }
										showRequiresAtLeast={
											showRequiresAtLeast
										}
										showRequiresPHP={ showRequiresPHP }
										showTestedUpTo={ showTestedUpTo }
										showVersion={ showVersion }
									/>
								) ) }
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};
