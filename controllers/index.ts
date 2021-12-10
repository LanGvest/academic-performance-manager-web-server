import {Request, Response} from "express";
import {getApps, initializeApp} from "firebase/app";
import {get, getDatabase, ref, set, push} from "firebase/database";
import Config from "../config";

!getApps().length && initializeApp(JSON.parse(Config.FIREBASE_CONFIG as string));
const DB_ROOT: string = `/apm:${Config.DOMAIN.replace(/\./g, "-")}`;
const db = getDatabase();

interface Student {
	id: number // id студента
	fio: string // ФИО студента
	avg: number // ср. балл студента
	faq: string // наименование факультета
	kaf: string // наименование кафедры
	grp: string // наименование группы
}

const IndexController = {
	/*
	ПАРАМЕТР filter
	это тип фильтрации:
	f - все студенты факультета
	k - все студенты кафедры
	g - все студенты группы
	id - студент по id

	ПАРАМЕТР value
	значение по которому будет проходить фильтрация

	ПРИМЕРЫ
	https://domain.com/getStudents?token=TOKEN - все студенты (без фильтраций)
	https://domain.com/getStudents?token=TOKEN&filter=f&value=Физический - студенты Физического факультета
	https://domain.com/getStudents?token=TOKEN&filter=k&value=АСОИ - студенты кафедры АСОИ
	https://domain.com/getStudents?token=TOKEN&filter=g&value=АС-36 - студенты группы АС-36
	https://domain.com/getStudents?token=TOKEN&filter=id&value=12 - студент с id 12
	 */
	async getStudents(req: Request, res: Response): Promise<void> {
		try {
			let {filter, value} = req.query;
			let result: Array<Student> = [];
			let snap = await get(ref(db, DB_ROOT + "/students"));
			if(snap.exists()) {
				let obj: {[key: string]: Student} = snap.val();
				Object.keys(obj).forEach(key => {
					if(filter && value) {
						switch(filter) {
							case "f": if(value === obj[key].faq) result.push(obj[key]); break;
							case "k": if(value === obj[key].kaf) result.push(obj[key]); break;
							case "g": if(value === obj[key].grp) result.push(obj[key]); break;
							case "id": if(value === obj[key].id.toString()) result.push(obj[key]); break;
							default: result.push(obj[key]);
						}
					} else result.push(obj[key]);
				});
			}
			res.status(200).json({
				ok: true,
				result
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	/*
	ПАРАМЕТР filter
	это тип фильтрации:
	f - ср. балл всех студентов факультета
	k - ср. балл всех студентов кафедры
	g - ср. балл всех студентов группы
	id - ср. балл студента по id

	ПАРАМЕТР value
	значение по которому будет проходить фильтрация

	ПРИМЕРЫ
	https://domain.com/getAvg?token=TOKEN - ср. балл всех студентов (без фильтраций)
	https://domain.com/getAvg?token=TOKEN&filter=f&value=Физический - ср. балл всех студентов Физического факультета
	https://domain.com/getAvg?token=TOKEN&filter=k&value=АСОИ - ср. балл всех студентов кафедры АСОИ
	https://domain.com/getAvg?token=TOKEN&filter=g&value=АС-36 - ср. балл всех студентов группы АС-36
	https://domain.com/getAvg?token=TOKEN&filter=id&value=12 - ср. балл студента с id 12
	 */
	async getAvg(req: Request, res: Response): Promise<void> {
		try {
			let {filter, value} = req.query;
			let result: number = 0;
			let students: Array<Student> = [];
			const add = (student: Student) => {
				students.push(student);
				result += student.avg;
			};
			let snap = await get(ref(db, DB_ROOT + "/students"));
			if(snap.exists()) {
				let obj: {[key: string]: Student} = snap.val();
				Object.keys(obj).forEach(key => {
					if(filter && value) {
						switch(filter) {
							case "f": if(value === obj[key].faq) add(obj[key]); break;
							case "k": if(value === obj[key].kaf) add(obj[key]); break;
							case "g": if(value === obj[key].grp) add(obj[key]); break;
							case "id": if(value === obj[key].id.toString()) add(obj[key]); break;
							default: add(obj[key]);
						}
					} else add(obj[key]);
				});
			}
			if(students.length && result !== 0) result /= students.length;
			res.status(200).json({
				ok: true,
				result
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	/*
	ПАРАМЕТР id
	id студентв, для которого нужно обновить поле

	ПАРАМЕТР field
	имя поля, которое нужно обновить:
	fio - фио студента
	avg - ср. балл студента
	faq - наименование факультета
	kaf - наименование кафедры
	grp - наименование группы

	ПАРАМЕТР value
	новое значение, для выбранного поля

	ПРИМЕРЫ
	https://domain.com/updateStudent?token=TOKEN&id=12&field=fio&value=НовоеФио
	https://domain.com/updateStudent?token=TOKEN&id=12&field=avg&value=8.6
	https://domain.com/updateStudent?token=TOKEN&id=12&field=faq&value=НовыйФакультет
	https://domain.com/updateStudent?token=TOKEN&id=12&field=kaf&value=АСОИ2
	https://domain.com/updateStudent?token=TOKEN&id=12&field=grp&value=АС-46
	 */
	async updateStudent(req: Request, res: Response): Promise<void> {
		try {
			let {id, field, value} = req.query;
			let targetStudentKey: string = "";
			let snap = await get(ref(db, DB_ROOT + "/students"));
			if(snap.exists()) {
				let obj: {[key: string]: Student} = snap.val();
				Object.keys(obj).forEach(key => {
					if(id === obj[key].id.toString()) targetStudentKey = key;
				});
			}
			if(targetStudentKey) {
				switch(field) {
					case "id": {
						res.status(500).json({
							ok: false,
							error: "You can not change 'id' field of the student!"
						});
						break;
					}
					case "fio": {
						await set(ref(db, DB_ROOT + `/students/${targetStudentKey}/fio`), (value as string)?.trim());
						break;
					}
					case "avg": {
						await set(ref(db, DB_ROOT + `/students/${targetStudentKey}/avg`), +(value as string));
						break;
					}
					case "faq": {
						await set(ref(db, DB_ROOT + `/students/${targetStudentKey}/faq`), (value as string)?.trim());
						break;
					}
					case "kaf": {
						await set(ref(db, DB_ROOT + `/students/${targetStudentKey}/kaf`), (value as string)?.trim());
						break;
					}
					case "grp": {
						await set(ref(db, DB_ROOT + `/students/${targetStudentKey}/grp`), (value as string)?.trim());
						break;
					}
					default: {
						res.status(500).json({
							ok: false,
							error: `The student have not the field named '${field}'!`
						});
					}
				}
				res.status(200).json({
					ok: true
				});
			} else {
				res.status(500).json({
					ok: false,
					error: `No such student with id ${id}!`
				});
			}
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	/*
	ПАРАМЕТР fio
	фио студента

	ПАРАМЕТР avg
	ср. балл студента

	ПАРАМЕТР faq
	наименование факультета

	ПАРАМЕТР kaf
	наименование кафедры

	ПАРАМЕТР grp
	наименование группы

	ПРИМЕР
	https://domain.com/addStudent?token=TOKEN&fio=Логвинец_Вячеслав_Александрович&avg=8.7&faq=Физический&kaf=АСОИ&grp=АС-36
	 */
	async addStudent(req: Request, res: Response): Promise<void> {
		try {
			let {fio, avg, faq, kaf, grp} = req.query;
			let ids: number = 0;
			let snap = await get(ref(db, DB_ROOT + "/ids"));
			if(snap.exists()) ids = snap.val();
			let student: Student = {
				id: ids+1,
				fio: `${fio}`,
				avg: Number(avg),
				faq: `${faq}`,
				kaf: `${kaf}`,
				grp: `${grp}`
			};
			await push(ref(db, DB_ROOT + "/students"), student);
			await set(ref(db, DB_ROOT + "/ids"), ids+1);
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	/*
	ПАРАМЕТР id
	id студента, которого нужно удалить

	ПРИМЕР
	https://domain.com/deleteStudent?token=TOKEN&id=12
	 */
	async deleteStudent(req: Request, res: Response): Promise<void> {
		try {
			let {id} = req.query;
			let targetStudentKey: string = "";
			let snap = await get(ref(db, DB_ROOT + "/students"));
			if(snap.exists()) {
				let obj: {[key: string]: Student} = snap.val();
				Object.keys(obj).forEach(key => {
					if(id === obj[key].id.toString()) targetStudentKey = key;
				});
			}
			if(targetStudentKey) {
				await set(ref(db, DB_ROOT + `/students/${targetStudentKey}`), null);
				res.status(200).json({
					ok: true
				});
			} else {
				res.status(500).json({
					ok: false,
					error: `No such student with id ${id}!`
				});
			}
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	}
};
export default IndexController;