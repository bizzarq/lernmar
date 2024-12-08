import json
import os
from typing import Any


def generate_index(course_dir: str) -> list[dict[str, Any]]:
    """
    scans the courses in a directory and generates an index.
    @param course_dir directory with courses.
    @return index as a list of dictionaries.
    """
    courses = []
    for name in os.listdir(course_dir):
        path = os.path.join(course_dir, name)
        if os.path.isdir(path):
            course = scan_course(course_dir, path)
            if course is not None:
                courses.append(course)
    return courses

def write_index(course_dir: str, index: list[dict[str, Any]]) -> None:
    """
    generates an index.json file for an index.
    @param course directory the index is for.
    @param index index to write.
    """
    path = os.path.join(course_dir, 'index.json')
    with open(path, mode='wt') as file:
        json.dump({'courses': index}, file)

def scan_course(course_dir: str, path: str) -> dict[str, Any] | None:
    """
    scans a course and generates and index entry for it.
    @param: course_dir directory the course belongs to (which is used to generate relative paths).
    @param: path path of course in file sytem.
    @return index entry for course.
    """
    abs_path = os.path.join(path, 'index.html')
    if os.path.isfile(abs_path):
        name = os.path.basename(os.path.dirname(abs_path))
        path = os.path.relpath(abs_path, course_dir)
        return {'name': name, 'path': path}
    return None



if __name__ == '__main__':
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    course_dir = os.path.join(root_dir, 'dist', 'courses')
    index = generate_index(course_dir)
    write_index(course_dir, index)
