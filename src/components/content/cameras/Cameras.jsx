import { useEffect, useState } from "react";
import style from "./style.module.scss";
import { io } from "socket.io-client";
import NoVideo from "../../../assets/no_video.jpg";
import NoCamera from "../../../assets/no_camera.png";
import CorruptFrame from "../../../assets/corrupt_frame.jpg";
import Refresh from "../../../assets/loading-arrow.png";
import Delete from "../../../assets/remove.png";
import Loading from "../../../assets/loading.jpg";

const API_BASE_URL = "http://localhost:7000";

const CAMERA_TYPE_USB = "usb";
const CAMERA_TYPE_HTTPS = "https";
const CAMERA_TYPE_RSTP = "rstp";
const CAMERA_TYPE_GUID = "guid";

const socket = io(API_BASE_URL, { reconnectionAttempts: 10 });

const ERROR_CAMERA_NOT_FOUND = 0;
const ERROR_NO_VIDEO = 1;
const ERROR_CORRUPT_FRAME = 2;
const ERROR_ENCODING_FAILED = 3;

const Cameras = () => {
	const [cameraList, setCameraList] = useState([]);
	const [socketConnected, setSocketConnected] = useState(false);
	const [feed, setFeed] = useState(null);
    const [feedError, setFeedError] = useState(null);
    const [refreshing, setRefreshing] = useState(null);

	const onAddNewCamera = (cameraObj) => {
		socket.emit("start_stream", cameraObj.cameraType, cameraObj.cameraSource);
		setCameraList((prev) => [...prev, cameraObj]);
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
			<div className={style["content"]}>
				<NewCameraForm onSubmit={onAddNewCamera} />
				<div className={style["camera-container"]}>
					{cameraList.map((camera, index) => (
						<CameraCard
							key={index}
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
			</div>
		</div>
	);
};

const CameraCard = ({ feed, error, camera, onRefreshClick, onDelete, refreshing }) => {
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
		<div className={style["camera-card"]}>
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
				<img onClick={onRefreshClick} src={Refresh} />
				<img onClick={onDelete} src={Delete} />
			</div>
			<div className={style["info-container"]}>
				<p>{camera.name}</p>
				<p>{camera.room + " • " + camera._class}</p>
			</div>
		</div>
	);
};

const usbCameras = [0, 1, 2, 3, 4, 5];

const NewCameraForm = ({ onSubmit }) => {
	const [name, setName] = useState("");
	const [camera, setCamera] = useState("");
	const [cameraType, setCameraType] = useState("");
	const [room, setRoom] = useState("");
	const [_class, set_Class] = useState("");
	const [error, setError] = useState(null);

	const onAddNewCamera = () => {
		if (name.trim() == "") return setError("Name empty");
		if (room.trim() == "") return setError("Room number empty");
		if (cameraType.trim() == "") return setError("Camera type invalid");
		if (camera.trim() == "") return setError("Camera source empty");
		if (_class.trim() == "") return setError("Class empty");
		const data = {
			name: name,
			cameraSource: camera,
			cameraType: cameraType,
			room: room,
			_class: _class,
		};
        onSubmit(data);
        setName("");
        setCamera("");
        setCameraType("");
        setRoom("");
        set_Class("");
    };
    
    useEffect(() => {
        setCamera("");
    }, [cameraType])

	const cameraTypes = [
		{
			value: CAMERA_TYPE_USB,
			label: "USB Camera",
		},
		{
			value: CAMERA_TYPE_HTTPS,
			label: "HTTPS",
		},
		{
			value: CAMERA_TYPE_RSTP,
			label: "RSTP",
		},
		{
			value: CAMERA_TYPE_GUID,
			label: "GUID",
		},
	];

	return (
		<div className={style["new-camera-form"]}>
			{error && (
				<div className={style["error-div"]}>
					<div className={style["error-card"]}>
						<p>{error}</p>
						<button onClick={() => setError(null)}>Ok</button>
					</div>
				</div>
			)}
			<p>Add New Camera</p>
			<div className={style["form-container"]}>
				<Input
					value={name}
					onValueChange={(e) => setName(e.target.value)}
					label={"Name"}
				/>
				<Input
					value={room}
					onValueChange={(e) => setRoom(e.target.value)}
					label={"Room"}
				/>

				<SelectInput
					value={cameraType}
					onValueChange={(e) => setCameraType(e.target.value)}
					label={"Camera Type"}
					items={cameraTypes}
				/>

				{cameraType === CAMERA_TYPE_USB && (
					<SelectInput
						value={camera}
						onValueChange={(e) => setCamera(e.target.value)}
						label={"Camera"}
						items={usbCameras.map((camera) => ({
							value: camera,
							label: `Camera-${camera}`,
						}))}
					/>
				)}
				{cameraType !== CAMERA_TYPE_USB && (
					<Input
						value={camera}
						onValueChange={(e) => setCamera(e.target.value)}
						label={"Url"}
					/>
				)}
				<Input
					value={_class}
					onValueChange={(e) => set_Class(e.target.value)}
					label={"Class"}
				/>
				<button onClick={onAddNewCamera}>Submit</button>
			</div>
		</div>
	);
};

const Input = ({ value, onValueChange, label }) => {
	return (
		<div className={style["input-container"]}>
			<p>{label}</p>
			<input value={value} onChange={onValueChange} type="text" />
		</div>
	);
};

const SelectInput = ({ value, onValueChange, label, items = [] }) => {
	return (
		<div className={style["input-container"]}>
			<p>{label}</p>
			<select value={value} onChange={onValueChange}>
				<option value={""}></option>
				{items &&
					items.map((item, index) => {
						return (
							<option key={index} value={item.value}>
								{item.label}
							</option>
						);
					})}
			</select>
		</div>
	);
};

export default Cameras;
