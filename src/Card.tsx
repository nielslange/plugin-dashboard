import ActiveInstalls from './Card/ActiveInstalls';
import Downloads from './Card/Downloads';
import NumberOfRatings from './Card/NumberOfRatings';
import Rating from './Card/Rating';
import RequiresAtLeast from './Card/RequiresAtLeast';
import RequiresPHP from './Card/RequiresPHP';
import TestedUpTo from './Card/TestedUpTo';
import Version from './Card/Version';

export const Card = ( props: any ) => {
	const {
		plugin,
		showActiveInstalls,
		showDownloads,
		showNumberOfRatings,
		showRating,
		showRequiresAtLeast,
		showRequiresPHP,
		showTestedUpTo,
		showVersion,
	} = props;

	const pluginLink = `https://wordpress.org/plugins/${ plugin.slug }`;

	const decodeHTML = function ( html: any ) {
		var txt = document.createElement( 'textarea' );
		txt.innerHTML = html;
		return txt.value;
	};

	return (
		<div className="col-sm-12 col-md-4 col-lg-4 col-xl-4 col-xxl-3 px-2 py-3">
			<div className="card h-100">
				<a href={ pluginLink } target="_blank">
					<img
						src={ plugin.banners[ 'low' ] }
						alt={ decodeHTML( plugin.name ) }
						className="card-img-top"
					/>
				</a>
				<div className="card-body d-flex flex-column justify-content-between">
					<h5 className="card-title">
						{ decodeHTML( plugin.name ) }
					</h5>
					<p className="card-text">
						{ decodeHTML( plugin.short_description ) }
					</p>

					<table className="table">
						<tbody>
							<ActiveInstalls
								showActiveInstalls={ showActiveInstalls }
								plugin={ plugin }
							/>
							<Downloads
								showDownloads={ showDownloads }
								plugin={ plugin }
							/>
							<NumberOfRatings
								showNumberOfRatings={ showNumberOfRatings }
								plugin={ plugin }
							/>
							<Rating
								showRating={ showRating }
								plugin={ plugin }
							/>
							<RequiresAtLeast
								showRequiresAtLeast={ showRequiresAtLeast }
								plugin={ plugin }
							/>
							<RequiresPHP
								showRequiresPHP={ showRequiresPHP }
								plugin={ plugin }
							/>
							<TestedUpTo
								showTestedUpTo={ showTestedUpTo }
								plugin={ plugin }
							/>
							<Version
								showVersion={ showVersion }
								plugin={ plugin }
							/>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
