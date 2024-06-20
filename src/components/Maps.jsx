import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import styles from "./ProfileView.module.css";
import Modal from "./Modal";

const MAPS_API_KEY = import.meta.env.VITE_MAP_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID;
const libraries = ["places"];

const loader = new Loader({
  apiKey: MAPS_API_KEY,
  version: "weekly",
  libraries,
});

const Maps = ({ restrictions }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [currLoc, setCurrLoc] = useState(null);
  const [currAddress, setCurrAddress] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTravelMode, setSelectedTravelMode] = useState(null);
  const [travelDurations, setTravelDurations] = useState({});
  const mapRef = useRef(null);
  const currLocMarkerRef = useRef(null);

  useEffect(() => {
    const loadMap = async () => {
      await loader.load();

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 1.3521, lng: 103.8198 },
        zoom: 15,
        mapId: MAP_ID,
      });
      setMap(mapInstance);
      setIsLoaded(true);

      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer();
      directionsRendererInstance.setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const currentLocation = { lat: latitude, lng: longitude };
            setCurrLoc(currentLocation);
            mapInstance.setCenter(currentLocation);
            await fetchAddress(currentLocation);
            const marker = new google.maps.Marker({
              position: currentLocation,
              map: mapInstance,
              title: "Current Location",
            });
            currLocMarkerRef.current = marker;
          },
          (error) => {
            console.error("Error getting current location:", error);
          }
        );
      }

      mapInstance.addListener("tilesloaded", () => {
        if (restrictions && restrictions.length > 0) {
          fetchPlaces(mapInstance, restrictions);
        }
      });
    };

    loadMap();
  }, [restrictions]);

  const fetchPlaces = async (map, restrictions) => {
    const service = new google.maps.places.PlacesService(map);
    const request = {
      query: restrictions.join(" OR "),
      fields: ["name", "geometry", "vicinity", "place_id"],
    };
    try {
      const results = await new Promise((resolve, reject) => {
        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });

      setPlaces(results.slice(0, 3));
      results.slice(0, 3).forEach((place) => {
        const markerElement = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
        });
      });
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const fetchAddress = async (location) => {
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location });
      if (response.results && response.results.length > 0) {
        setCurrAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    const service = new google.maps.places.PlacesService(map);
    const request = {
      placeId,
      fields: [
        "name",
        "formatted_address",
        "formatted_phone_number",
        "website",
        "rating",
        "photos",
        "reviews",
      ],
    };
    try {
      const placeDetails = await new Promise((resolve, reject) => {
        service.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            reject(status);
          }
        });
      });
      setSelectedPlace(placeDetails);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const calculateAndDisplayRoute = async (place) => {
    if (!currLoc) {
      console.error("Current location is not available");
      return;
    }
    setSelectedPlace(place);
    setShowModal(true);

    const request = {
      origin: currLoc,
      destination: place.geometry.location,
      travelMode: google.maps.TravelMode.WALKING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        const walkingDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        const drivingDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        const transitDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        setTravelDurations({
          walking: formatDuration(walkingDuration),
          driving: formatDuration(drivingDuration),
          transit: formatDuration(transitDuration),
        });
      } else {
        console.error("Directions request failed:", status);
      }
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours} hr ` : ""}${remainingMinutes} min`;
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTravelModeSelect = (travelMode) => {
    setSelectedTravelMode(travelMode);

    const request = {
      origin: currLoc,
      destination: selectedPlace.geometry.location,
      travelMode: travelMode,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        const walkingDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        const drivingDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        const transitDuration = result.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value,
          0
        );
        setTravelDurations({
          walking: formatDuration(walkingDuration),
          driving: formatDuration(drivingDuration),
          transit: formatDuration(transitDuration),
        });
      } else {
        console.error("Directions request failed:", status);
      }
    });

    setShowModal(false);
  };

  return (
    <div className={styles.mapsContainer}>
      <div
        id="map"
        ref={mapRef}
        className={styles.map}
        style={{ height: "400px", width: "100%" }}
      />
      <div className={styles.placesContainer}>
        <h3 className={styles.placesHeader}>Current Location</h3>
        {currAddress ? <p>{currAddress}</p> : <p>Loading current address...</p>}
        <h3 className={styles.placesHeader}>Places</h3>
        <ul className={styles.placesList}>
          {places.map((place, index) => (
            <li key={index} className={styles.placeItem}>
              <div className={styles.placeInfo}>
                <strong className={styles.placeName}>{place.name}</strong>
                <p className={styles.placeAddress}>{place.vicinity}</p>
              </div>
              <button
                className={styles.getDirectionsBtn}
                onClick={() => calculateAndDisplayRoute(place)}
              >
                Get Directions
              </button>
              <button
                className={styles.getDetailsBtn}
                onClick={() => fetchPlaceDetails(place.place_id)}
              >
                Details
              </button>
            </li>
          ))}
        </ul>
        {showModal && selectedPlace && (
          <Modal onClose={closeModal}>
            <div className={styles.modalContent}>
              <h3>{selectedPlace.name}</h3>
              <p>{selectedPlace.formatted_address}</p>
              {selectedPlace.formatted_phone_number && (
                <p>Phone: {selectedPlace.formatted_phone_number}</p>
              )}
              {selectedPlace.rating && <p>Rating: {selectedPlace.rating}</p>}
              {selectedPlace.website && (
                <p>
                  Website:{" "}
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedPlace.website}
                  </a>
                </p>
              )}
              {selectedPlace.photos && (
                <div className={styles.photosContainer}>
                  {selectedPlace.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.getUrl()}
                      alt={`Photo ${index}`}
                      className={styles.placePhoto}
                    />
                  ))}
                </div>
              )}
              {selectedPlace.reviews && (
                <div className={styles.reviewsContainer}>
                  <h4>Reviews</h4>
                  {selectedPlace.reviews.map((review, index) => (
                    <div key={index} className={styles.reviewItem}>
                      <p>{review.text}</p>
                      <p>Rating: {review.rating}</p>
                      <p>Author: {review.author_name}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedTravelMode && (
                <div className={styles.travelTimes}>
                  <h4>Travel Times:</h4>
                  <p>Walking: {travelDurations.walking}</p>
                  <p>Driving: {travelDurations.driving}</p>
                  <p>Public Transport: {travelDurations.transit}</p>
                </div>
              )}

              <div className={styles.travelModeSelection}>
                <h4>Select Travel Mode:</h4>
                <button
                  className={styles.travelModeBtn}
                  onClick={() =>
                    handleTravelModeSelect(google.maps.TravelMode.WALKING)
                  }
                >
                  Walking
                </button>
                <button
                  className={styles.travelModeBtn}
                  onClick={() =>
                    handleTravelModeSelect(google.maps.TravelMode.DRIVING)
                  }
                >
                  Driving
                </button>
                <button
                  className={styles.travelModeBtn}
                  onClick={() =>
                    handleTravelModeSelect(google.maps.TravelMode.TRANSIT)
                  }
                >
                  Public Transport
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Maps;
