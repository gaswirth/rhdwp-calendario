<?php
class Calendario_Route extends WP_REST_Controller {
	function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		$version   = '1';
		$namespace = 'calendario/v' . $version;
		$base      = 'posts';

		register_rest_route( $namespace, '/' . $base . '/(?P<start>.*?)/(?P<end>.*?)/(?P<status>[\w]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array( $this->get_range_endpoint_args() ),
			),
		) );

		register_rest_route( $namespace, '/' . $base . '/unscheduled', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_unscheduled_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
		) );

		// register_rest_route( $namespace, '/' . $base . '/(?P<id>[\d]+)', array(
		// 	array(
		// 		'methods'             => WP_REST_Server::READABLE,
		// 		'callback'            => array( $this, 'get_item' ),
		// 		'permission_callback' => array( $this, 'get_item_permissions_check' ),
		// 		'args'                => array(
		// 			'context' => array(
		// 				'default' => 'view',
		// 			),
		// 		),
		// 	),
		// 	array(
		// 		'methods'             => WP_REST_Server::EDITABLE,
		// 		'callback'            => array( $this, 'update_item' ),
		// 		'permission_callback' => array( $this, 'update_item_permissions_check' ),
		// 		'args'                => $this->get_endpoint_args_for_item_schema( false ),
		// 	),
		// 	array(
		// 		'methods'             => WP_REST_Server::DELETABLE,
		// 		'callback'            => array( $this, 'delete_item' ),
		// 		'permission_callback' => array( $this, 'delete_item_permissions_check' ),
		// 		'args'                => array(
		// 			'force' => array(
		// 				'default' => false,
		// 			),
		// 		),
		// 	),
		// ) );

		// register_rest_route( $namespace, '/' . $base . '/schema', array(
		// 	'methods'  => WP_REST_Server::READABLE,
		// 	'callback' => array( $this, 'get_public_item_schema' ),
		// ) );
	}

	/**
	 * Get a collection of items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_items( $request ) {
		$items = get_posts( array(
			'before'      => isset( $request['start'] ) ? $request['start'] : null,
			'after'       => isset( $request['end'] ) ? $request['end'] : null,
			'post_status' => isset( $request['status'] ) ? $request['status'] : null,
			'inclusive'   => true,
			'meta_query'  => array(
				'relation' => 'OR',
				array(
					'key'     => 'rhd_unscheduled',
					'compare' => '=',
					'value'   => false,
				),
				array(
					'key'     => 'rhd_unscheduled',
					'compare' => 'NOT EXISTS',
				),
			),
		) );

		$data = [];
		foreach ( $items as $item ) {
			$data[] = $this->prepare_item_for_response( $item, $request );
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Get a collection of items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_unscheduled_items( $request ) {
		$items = get_posts( array(
			'meta_query'     => array(
				'relation' => 'OR',
				array(
					'key'     => 'rhd_unscheduled',
					'compare' => '=',
					'value'   => true,
				),
				array(
					'key'     => 'rhd_unscheduled',
					'compare' => 'EXISTS',
				),
			),
			'posts_per_page' => -1,
			'post_status'    => 'any',
		) );

		$data = [];
		foreach ( $items as $item ) {
			$data[] = $this->prepare_unscheduled_item_for_response( $item, $request );
		}

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Get one item from the collection
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_item( $request ) {
		//get parameters from request
		$params = $request->get_params();
		$item   = []; //do a query, call another class, etc
		$data   = $this->prepare_item_for_response( $item, $request );

		//return a response or error based on some conditional
		if ( 1 == 1 ) {
			return new WP_REST_Response( $data, 200 );
		} else {
			return new WP_Error( 'code', __( 'message', 'text-domain' ) );
		}
	}

	/**
	 * Update one item from the collection
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function update_item( $request ) {
		$item = $this->prepare_item_for_database( $request );

		if ( function_exists( 'slug_some_function_to_update_item' ) ) {
			// $data = slug_some_function_to_update_item( $item );
			// if ( is_array( $data ) ) {
			// 	return new WP_REST_Response( $data, 200 );
			// }
		}

		return new WP_Error( 'cant-update', __( 'message', 'text-domain' ), array( 'status' => 500 ) );
	}

	/**
	 * Delete one item from the collection
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function delete_item( $request ) {
		$item = $this->prepare_item_for_database( $request );

		if ( function_exists( 'slug_some_function_to_delete_item' ) ) {
			// $deleted = slug_some_function_to_delete_item( $item );
			// if ( $deleted ) {
			// 	return new WP_REST_Response( true, 200 );
			// }
		}

		return new WP_Error( 'cant-delete', __( 'message', 'text-domain' ), array( 'status' => 500 ) );
	}

	/**
	 * Check if a given request has access to get items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function get_items_permissions_check( $request ) {
		return true; /*<--use to make readable by all*/
		// return current_user_can( 'edit_others_posts' );
	}

	/**
	 * Check if a given request has access to get a specific item
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function get_item_permissions_check( $request ) {
		return $this->get_items_permissions_check( $request );
	}

	/**
	 * Get argument schema for post data.
	 *
	 * @return array $args
	 */
	public function get_range_endpoint_args() {
		$args          = array();
		$args['start'] = array(
			'description'       => esc_html__( 'Start date', 'rhd' ),
			'type'              => 'string',
			'validate_callback' => array( $this, 'validate_date_string' ),
			'sanitize_callback' => array( $this, 'sanitize_string' ),
			'required'          => true,
		);

		$args['end'] = array(
			'description'       => esc_html__( 'End date', 'rhd' ),
			'type'              => 'string',
			'validate_callback' => array( $this, 'validate_date_string' ),
			'sanitize_callback' => array( $this, 'sanitize_string' ),
			'required'          => true,
		);

		$args['status'] = array(
			'description'       => esc_html__( 'Post status', 'rhd' ),
			'type'              => 'string',
			'validate_callback' => array( $this, 'validate_string' ),
			'sanitize_callback' => array( $this, 'sanitize_string' ),
			'required'          => true,
		);

		return $args;
	}

	/**
	 * Validate strings
	 *
	 * @param mixed           $value   Value of the my-arg parameter.
	 * @param WP_REST_Request $request Current request object.
	 * @param string          $param   The name of the parameter in this case, 'my-arg'.
	 * @return true|WP_Error True if the data is valid, WP_Error otherwise.
	 */
	public function validate_string( $value, $request, $param ) {
		$atts = $request->get_attributes();

		if ( isset( $atts['args'][$param] ) ) {
			$arg = $atts['args'][$param];

			if ( 'string' === $arg['type'] && ! is_string( $value ) ) {
				return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%1$s is not of type %2$s.', 'rhd' ), $param, 'string' ), array( 'status' => 400 ) );
			}
		} else {
			return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%s was not specified as an argument', 'rhd' ), $param ), array( 'status' => 400 ) );
		}

		return true;
	}

	/**
	 * Validate date strings
	 *
	 * @param mixed           $value   Value of the my-arg parameter.
	 * @param WP_REST_Request $request Current request object.
	 * @param string          $param   The name of the parameter in this case, 'my-arg'.
	 * @return true|WP_Error True if the data is valid, WP_Error otherwise.
	 */
	public function validate_date_string( $value, $request, $param ) {
		$atts = $request->get_attributes();

		if ( isset( $atts['args'][$param] ) ) {
			$arg = $atts['args'][$param];

			if ( 'string' === $arg['type'] && ! is_string( $value ) ) {
				return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%1$s is not of type %2$s.', 'rhd' ), $param, 'string' ), array( 'status' => 400 ) );
			} elseif ( rhd_validate_date( $value ) === false ) {
				return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%1$s is not a valid date.', 'rhd' ), $param ), array( 'status' => 400 ) );
			}
		} else {
			return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%s was not specified as an argument', 'rhd' ), $param ), array( 'status' => 400 ) );
		}

		return true;
	}

	/**
	 * Sanitize strings.
	 *
	 * @param mixed           $value   Value of the my-arg parameter.
	 * @param WP_REST_Request $request Current request object.
	 * @param string          $param   The name of the parameter in this case, 'my-arg'.
	 * @return mixed|WP_Error The sanitize value, or a WP_Error if the data could not be sanitized.
	 */
	function sanitize_string( $value, $request, $param ) {
		$attributes = $request->get_attributes();

		if ( isset( $attributes['args'][$param] ) ) {
			$argument = $attributes['args'][$param];

			if ( 'string' === $argument['type'] ) {
				return sanitize_text_field( $value );
			}
		} else {
			return new WP_Error( 'rest_invalid_param', sprintf( esc_html__( '%s was not registered as a request argument.', 'rhd' ), $param ), array( 'status' => 400 ) );
		}

		// If we got this far then something went wrong don't use user input.
		return new WP_Error( 'rest_api_sad', esc_html__( 'Something went terribly wrong.', 'rhd' ), array( 'status' => 500 ) );
	}

	/**
	 * Check if a given request has access to create items
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function create_item_permissions_check( $request ) {
		return current_user_can( 'edit_others_posts' );
	}

	/**
	 * Check if a given request has access to update a specific item
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function update_item_permissions_check( $request ) {
		return $this->create_item_permissions_check( $request );
	}

	/**
	 * Check if a given request has access to delete a specific item
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|bool
	 */
	public function delete_item_permissions_check( $request ) {
		return $this->create_item_permissions_check( $request );
	}

	/**
	 * Prepare the item for create or update operation
	 *
	 * @param WP_REST_Request $request Request object
	 * @return WP_Error|object $prepared_item
	 */
	protected function prepare_item_for_database( $request ) {
		return [];
	}

	/**
	 * Prepare the item for the REST response
	 *
	 * @param mixed $item WordPress representation of the item.
	 * @param WP_REST_Request $request Request object.
	 * @return array
	 */
	public function prepare_item_for_response( $item, $request ) {
		return [
			'title'  => $item->post_title,
			'start'  => $item->post_date,
			'id'     => $item->ID,
			'status' => $item->post_status,
		];
	}

	/**
	 * Prepare an 'unscheduled' item for the REST response
	 *
	 * @param mixed $item WordPress representation of the item.
	 * @param WP_REST_Request $request Request object.
	 * @return array
	 */
	public function prepare_unscheduled_item_for_response( $item, $request ) {
		return [
			'title' => $item->post_title,
			'date'  => $item->post_date,
			'id'    => $item->ID,
		];
	}

	/**
	 * Get the query params for collections
	 *
	 * @return array
	 */
	public function get_collection_params() {
		return array(
			'page'     => array(
				'description'       => 'Current page of the collection.',
				'type'              => 'integer',
				'default'           => 1,
				'sanitize_callback' => 'absint',
			),
			'per_page' => array(
				'description'       => 'Maximum number of items to be returned in result set.',
				'type'              => 'integer',
				'default'           => 10,
				'sanitize_callback' => 'absint',
			),
			'search'   => array(
				'description'       => 'Limit results to those matching a string.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}
}