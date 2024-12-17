import json
import os
import urllib
from pathlib import Path
import urllib.parse
from xml.etree import ElementTree
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

def scan_course(course_dir: str, course_path: str) -> dict[str, Any] | None:
    """
    scans a course and generates and index entry for it.
    @param: course_dir directory the course belongs to (which is used to generate relative paths).
    @param: course_path path of course in file sytem.
    @return index entry for course.
    """
    manifest_path = os.path.join(course_path, 'imsmanifest.xml')
    if not os.path.isfile(manifest_path):
        return None
    tree = ElementTree.parse(manifest_path)
    root = tree.getroot()
    elem = root.find('{http://www.imsglobal.org/xsd/imscp_v1p1}resources/{http://www.imsglobal.org/xsd/imscp_v1p1}resource')
    if elem is None:
        return None
    href = elem.get('href')
    if href is None:
        return None
    course_path = os.path.normpath(course_path)
    parsed_href = urllib.parse.urlparse(href)
    if parsed_href.scheme != '' or parsed_href.netloc != '':
        # ignore courses whose href is not a relative path
        return None
    index_abs_path = os.path.normpath(os.path.join(course_path, parsed_href.path))
    if not index_abs_path.startswith(course_path) or not os.path.isfile(index_abs_path):
        # ignore courses whose index file is not within the course directory
        return None
    name = os.path.basename(course_path)
    index_url = urllib.parse.urlunparse((
        '', '', f'{name}/{parsed_href.path}',
        parsed_href.params, parsed_href.query, parsed_href.fragment))
    return {'name': name, 'path': index_url}


if __name__ == '__main__':
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    course_dir = os.path.join(root_dir, 'dist', 'courses')
    index = generate_index(course_dir)
    write_index(course_dir, index)
