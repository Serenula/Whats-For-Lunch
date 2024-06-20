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
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
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
    };

    loadMap();
  }, []);

  useEffect(() => {
    if (isLoaded && currLoc && restrictions && restrictions.length > 0) {
      fetchPlaces(map, restrictions, currLoc);
    }
  }, [isLoaded, currLoc, restrictions, selectedPriceLevel]);

  const fetchPlaces = async (map, restrictions, location) => {
    const service = new google.maps.places.PlacesService(map);
    const request = {
      location,
      radius: "1000", // 1 km radius
      query: restrictions.join(" OR "),
      fields: ["name", "geometry", "vicinity", "place_id", "price_level"],
    };

    if (selectedPriceLevel) {
      request.minPriceLevel = selectedPriceLevel;
      request.maxPriceLevel = selectedPriceLevel;
    }

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
        "price_level",
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
      travelMode: google.maps.TravelMode.WALKING, // Default to walking
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

  const handlePriceLevelChange = (e) => {
    setSelectedPriceLevel(e.target.value);
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

  const priceLevelToString = (level) => {
    switch (level) {
      case 0:
        return "$ (Inexpensive)";
      case 1:
        return "$$ (Moderate)";
      case 2:
        return "$$$ (Expensive)";
      case 3:
        return "$$$$ (Very Expensive)";
      default:
        return "Unknown";
    }
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
        {/* Price level selector */}
        <div className={styles.priceLevelSelector}>
          <label htmlFor="priceLevel">Price Level:</label>
          <select
            id="priceLevel"
            value={selectedPriceLevel}
            onChange={handlePriceLevelChange}
          >
            <option value="">All</option>
            <option value="0">{priceLevelToString(0)}</option>
            <option value="1">{priceLevelToString(1)}</option>
            <option value="2">{priceLevelToString(2)}</option>
            <option value="3">{priceLevelToString(3)}</option>
          </select>
        </div>
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
      </div>
      {showModal && selectedPlace && (
        <Modal onClose={closeModal}>
          <h2>{selectedPlace.name}</h2>
          <p>{selectedPlace.formatted_address}</p>
          {selectedPlace.formatted_phone_number && (
            <p>Phone: {selectedPlace.formatted_phone_number}</p>
          )}
          {selectedPlace.website && (
            <p>
              Website:{" "}
              <a href={selectedPlace.website}>{selectedPlace.website}</a>
            </p>
          )}
          {selectedPlace.rating && <p>Rating: {selectedPlace.rating} / 5</p>}
          {selectedPlace.price_level && (
            <p>Price Level: {priceLevelToString(selectedPlace.price_level)}</p>
          )}
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <div>
              {selectedPlace.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.getUrl()}
                  alt={`${selectedPlace.name} photo ${index + 1}`}
                  className={styles.placePhoto}
                />
              ))}
            </div>
          )}
          {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
            <div>
              <h3>Reviews:</h3>
              <ul>
                {selectedPlace.reviews.map((review, index) => (
                  <li key={index}>
                    <strong>{review.author_name}:</strong> {review.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={styles.travelModeContainer}>
            <h3>Select Travel Mode:</h3>
            <button
              className={`${styles.travelModeBtn} ${
                selectedTravelMode === google.maps.TravelMode.WALKING
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleTravelModeSelect(google.maps.TravelMode.WALKING)
              }
            >
              Walking ({travelDurations.walking})
            </button>
            <button
              className={`${styles.travelModeBtn} ${
                selectedTravelMode === google.maps.TravelMode.DRIVING
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleTravelModeSelect(google.maps.TravelMode.DRIVING)
              }
            >
              Driving ({travelDurations.driving})
            </button>
            <button
              className={`${styles.travelModeBtn} ${
                selectedTravelMode === google.maps.TravelMode.TRANSIT
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleTravelModeSelect(google.maps.TravelMode.TRANSIT)
              }
            >
              Transit ({travelDurations.transit})
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Maps;
