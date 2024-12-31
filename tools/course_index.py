import json
import os
import sys
import urllib
import urllib.parse
from xml.etree import ElementTree
from typing import Any


def log(message: str) -> None:
    """
    logs a message to stderr.
    @param message message to log.
    """
    print(message, file=sys.stderr)

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
        json.dump({'courses': index}, file, indent=2)

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
        log(f'ignoring course {course_path} without resource element')
        return None
    href = elem.get('href')
    if href is None:
        log(f'ignoring course {course_path} without reference to index file')
        return None
    course_path = os.path.normpath(course_path)
    parsed_href = urllib.parse.urlparse(href)
    if parsed_href.scheme != '' or parsed_href.netloc != '':
        log(f'ignoring course {course_path} without relative path reference')
        return None
    index_abs_path = os.path.normpath(os.path.join(course_path, parsed_href.path))
    if not index_abs_path.startswith(course_path) or not os.path.isfile(index_abs_path):
        log(f'ignoring course {course_path} whose index file is not within the course directory')
        return None
    name = os.path.basename(course_path)
    index_url = urllib.parse.urlunparse((
        '', '', f'{name}/{parsed_href.path}',
        parsed_href.params, parsed_href.query, parsed_href.fragment))
    return {'name': name, 'path': index_url}


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        description='creates an index.json file for a folder with scorm courses.')
    parser.add_argument('course_dir', nargs='?',
        help='path of course directory. if omitted use default ../dist/player/courses')
    args = parser.parse_args()

    course_dir = args.course_dir
    if course_dir is None:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        course_dir = os.path.join(root_dir, 'dist', 'player', 'courses')
    index = generate_index(course_dir)
    write_index(course_dir, index)
