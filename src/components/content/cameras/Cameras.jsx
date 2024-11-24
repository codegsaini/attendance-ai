import { useEffect, useState } from "react";
import style from "./style.module.scss";
import { io } from "socket.io-client";
import NoVideo from "../../../assets/no_video.jpg";
import NoCamera from "../../../assets/no_camera.png";
import CorruptFrame from "../../../assets/corrupt_frame.jpg";
import Refresh from "../../../assets/loading-arrow.png";
import Delete from "../../../assets/remove.png";
import Loading from "../../../assets/loading.jpg";
import AddCamera from "../../../assets/add-camera.png";
import CameraPreview from "../../camera_preview/CameraPreview";

const API_BASE_URL = "https://attendance-ai-backend-38406260586.asia-south2.run.app";

const socket = io(API_BASE_URL, { reconnectionAttempts: 10 });

export const ERROR_CAMERA_NOT_FOUND = 0;
// const ERROR_NO_VIDEO = 1;
export const ERROR_CORRUPT_FRAME = 2;
export const ERROR_ENCODING_FAILED = 3;

const Cameras = ({showNewCameraForm, setShowNewCameraForm}) => {
	const [cameraList, setCameraList] = useState([]);
	const [socketConnected, setSocketConnected] = useState(false);
	const [feed, setFeed] = useState(null);
    const [feedError, setFeedError] = useState(null);
	const [refreshing, setRefreshing] = useState(null);
	const [previewCamera, setPreviewCamera] = useState(null);

	const onAddNewCamera = (cameraObj) => {
		socket.emit("start_stream", cameraObj.cameraType, cameraObj.cameraSource);
		setCameraList((prev) => [...prev, cameraObj]);
		setRefreshing((prev) => ({...prev, [cameraObj.cameraSource]: true}))
		setShowNewCameraForm(false);
	};

	const connectCallback = () => {
		setSocketConnected(true);
	};
	const disconnectCallback = () => {
		setSocketConnected(false);
	};

	const onVideoFrameReceived = (data) => {
		if (!data) return;
		if (data.success) {
			if (!data.data) return;
			const blob = new Blob([new Uint8Array(data.data)], {
				type: "image/jpeg",
			});
			setFeed((prev) => ({
				...prev,
				[data.source]: URL.createObjectURL(blob),
			}));
			setRefreshing((prev) => ({...prev, [data.source]: false}))
			setFeedError((prev) => ({ ...prev, [data.source]: undefined }));
			setTimeout(() => {
				URL.revokeObjectURL(blob);
			}, 1000);
		} else {
			setFeedError((prev) => ({ ...prev, [data.source]: data.error }));
			setFeed((prev) => ({ ...prev, [data.source]: undefined }));
		}
	};

    const onRefreshClick = (cameraType, cameraSource) => {
        socket.emit("stop_stream", cameraType, cameraSource);
        setRefreshing((prev) => ({...prev, [cameraSource]: true}))
        setTimeout(() => {
            socket.emit("start_stream", cameraType, cameraSource);
            setRefreshing((prev) => ({...prev, [cameraSource]: false}))
        }, 5000);
	};

	const onDelete = (cameraType, cameraSource) => {
		socket.emit("stop_stream", cameraType, cameraSource);
		const updatedCameraList = cameraList.filter((camera) => camera.cameraSource != cameraSource);
		setCameraList(updatedCameraList);
	};

	useEffect(() => {
		if (!socketConnected) return;
		socket.emit("stop_all_stream");
		socket.on("video_frame", onVideoFrameReceived);

		return () => {
			socket.off("video_frame", onVideoFrameReceived);
		};
	}, [socketConnected]);

	useEffect(() => {
		socket.on("connect", connectCallback);
		socket.on("disconnect", disconnectCallback);
		return () => {
			socket.off("connect", connectCallback);
			socket.off("disconnect", disconnectCallback);
		};
	}, []);
	

	return (
		<div className={style["container"]}>
			{
				showNewCameraForm &&
				<NewCameraForm onSubmit={onAddNewCamera} setShowNewCameraForm={setShowNewCameraForm} />
			}
			{
				previewCamera &&
				<CameraPreview
					previewCamera={previewCamera}
					feed={feed ? feed[previewCamera.cameraSource] : undefined}
					error={feedError ? feedError[previewCamera.cameraSource] : undefined}
					refreshing={refreshing ? refreshing[previewCamera.cameraSource] : false}
					onDismissRequest={() => setPreviewCamera(null)}
					onRefreshRequest={() => onRefreshClick(previewCamera.cameraType, previewCamera.cameraSource)}
				/>
			}
			<div className={style["content"]}>
				{
					cameraList.length < 1 &&
					<div className={style['no-camera-message-container']}>
						<img src={AddCamera} alt={"Add Camera Icon"}/>
						<p>No camera found</p>
						<p>Click on <button onClick={() => setShowNewCameraForm(true)}>Add Camera</button> button</p>
					</div>
				}
				{
					cameraList.length > 0 &&
					<div className={style["camera-container"]}>
						{cameraList.map((camera, index) => (
							<CameraCard
								key={index}
								onClick={() => setPreviewCamera(camera)}
								error={feedError ? feedError[camera.cameraSource] : undefined}
								feed={feed ? feed[camera.cameraSource] : undefined}
								camera={camera}
								onRefreshClick={() =>
									onRefreshClick(camera.cameraType, camera.cameraSource)
								}
								onDelete={() => onDelete(camera.cameraType, camera.cameraSource)}
								refreshing={refreshing ? refreshing[camera.cameraSource]: false}
							/>
						))}
					</div>
				}
			</div>
		</div>
	);
};

const CameraCard = ({ feed, error, camera, onRefreshClick, onDelete, refreshing, onClick }) => {
	let errorImage = NoVideo;
	switch (error) {
		case ERROR_CAMERA_NOT_FOUND:
			errorImage = NoCamera;
			break;
		case ERROR_CORRUPT_FRAME:
			errorImage = CorruptFrame;
			break;
		case ERROR_ENCODING_FAILED:
			errorImage = NoCamera;
			break;
		default:
			errorImage = NoVideo;
	}

	return (
		<div className={style["camera-card"]} onClick={onClick}>
			{!refreshing && feed != undefined && (
				<img className={style["feed-img"]} src={feed} alt={camera.name} />
			)}
			{!refreshing && feed == undefined && (
				<img
					className={style["no-video-placeholder"]}
					src={errorImage}
					alt={"No video"}
				/>
            )}
            {refreshing && (
				<img
					className={style["no-video-placeholder"]}
					src={Loading}
					alt={"Coming soon"}
				/>
			)}
			<div className={style["action-container"]}>
				<img onClick={(e) => {
					e.stopPropagation();
					onRefreshClick();
				}} src={Refresh} />
				<img onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}} src={Delete} />
			</div>
			<div className={style["info-container"]}>
				<p>{camera.name}</p>
				<p>{camera.room + " • " + camera._class}</p>
			</div>
		</div>
	);
};

const NewCameraForm = ({ onSubmit, setShowNewCameraForm }) => {
	const [name, setName] = useState("");
	const [camera, setCamera] = useState("");
	const [room, setRoom] = useState("");
	const [_class, set_Class] = useState("");
	const [error, setError] = useState(null);

	const onAddNewCamera = () => {
		if (name.trim() == "") return setError("Please provide name of camera");
		if (room.trim() == "") return setError("Please provide room number");
		if (camera.trim() == "") return setError("Please provide Camera URL");
		if (_class.trim() == "") return setError("Please provide class/section");
		const data = {
			name: name,
			cameraSource: camera,
			room: room,
			_class: _class,
		};
        onSubmit(data);
        setName("");
        setCamera("");
        setRoom("");
        set_Class("");
    };

	return (
		<div className={style['new-camera-form-container']}>
			<div className={style["new-camera-form"]}>
				{error && (
					<div className={style["error-div"]}>
						<div className={style["error-card"]}>
							<p>{error}</p>
							<button onClick={() => setError(null)}>Ok</button>
						</div>
					</div>
				)}
				<p className={style['new-camera-close-button']} onClick={() => setShowNewCameraForm(false)}>×</p>
				<p>Add New Camera</p>
				<div className={style["form-container"]}>
					<Input
						value={name}
						onValueChange={(e) => setName(e.target.value)}
						label={"Name"}
						placeholder={"eg. Cyber security attendance cam"}
					/>
					<Input
						value={room}
						onValueChange={(e) => setRoom(e.target.value)}
						label={"Room"}
						placeholder={"Room number(eg. 2208)"}
					/>
					<Input
						value={camera}
						onValueChange={(e) => setCamera(e.target.value)}
						label={"Url"}
						placeholder={"http:// or RTSP://"}
					/>
					<Input
						value={_class}
						onValueChange={(e) => set_Class(e.target.value)}
						label={"Class"}
						placeholder={"Class (eg. 21/CY)"}
					/>
					<button onClick={onAddNewCamera}>Submit</button>
				</div>
			</div>
		</div>
	);
};

const Input = ({ value, onValueChange, label, placeholder }) => {
	return (
		<div className={style["input-container"]}>
			<p>{label}</p>
			<input value={value} placeholder={placeholder} onChange={onValueChange} type="text" />
		</div>
	);
};

// const SelectInput = ({ value, onValueChange, label, items = [] }) => {
// 	return (
// 		<div className={style["input-container"]}>
// 			<p>{label}</p>
// 			<select value={value} onChange={onValueChange}>
// 				<option value={""}></option>
// 				{items &&
// 					items.map((item, index) => {
// 						return (
// 							<option key={index} value={item.value}>
// 								{item.label}
// 							</option>
// 						);
// 					})}
// 			</select>
// 		</div>
// 	);
// };

export default Cameras;
