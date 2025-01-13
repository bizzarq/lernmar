import json
import os
import sys
import urllib
import urllib.parse
from xml.etree import ElementTree
from typing import Any, Optional, TypeAlias


def log(message: str) -> None:
    """
    logs a message to stderr.
    @param message message to log.
    """
    print(message, file=sys.stderr)


type Course = dict[str, Any]


class CourseIndex:
    """
    representation of a course index.
    """

    def __init__(self, course_dir: Optional[str]=None) -> None:
        """
        constructor.
        @param course_dir directory the index is for. if omitted, current directory.
        """
        if course_dir is None:
            course_dir = os.getcwd()
        self._course_dir = course_dir
        self._courses = []

    def add_course(self, course: Course) -> None:
        """
        adds a course to the index.
        if there is already a course with the same name, the old entry will be deleted.
        @param course course to add.
        """
        self.remove_course(course)
        self._courses.append(course)

    def remove_course(self, course: Course) -> bool:
        """
        removes a course from the index.
        only the course name is used to distinguish courses.
        does nothing if the course is not in the index.
        @param course course to remove.
        @return whether the course existed (and was removed).
        """
        for course_id1, course1 in enumerate(self._courses):
            if course['name'] == course1['name']:
                del self._courses[course_id1]
                return True
        return False

    def __iter__(self):
        """
        iterates over the courses inside the index. the iterator operates on a copy of the data.
        changes will not be reflected.
        """
        return iter(list(self._courses))

    def read(self, path: Optional[str]=None) -> bool:
        """
        reads an index from a file.
        @param path path of index file. "index.json" in course directory if omitted.
        @return whether the index was read successfully (which is false if tge file does not exist).
        """
        if path is None:
            path = os.path.join(self._course_dir, 'index.json')
        if not os.path.isfile(path):
            return False
        with open(path, mode='rt') as file:
            data = json.load(file)
            for course in data['courses']:
                if isinstance(course.get('name'), str) and isinstance(course.get('path'), str):
                    self.add_course(course)
                else:
                    log(f'ignoring invalid course entry {course}')
        return True

    def write(self, path: Optional[str]=None) -> None:
        """
        writes the index to a file.
        @param path path of index file. "index.json" in course directory if omitted.
        """
        if path is None:
            path = os.path.join(self._course_dir, 'index.json')
        with open(path, mode='wt') as file:
            json.dump({'courses': self._courses}, file, indent=2)

    def clear(self) -> None:
        """
        clears the index.
        """
        self._courses.clear()

    def from_course_dir(self, course_dir: Optional[str]=None) -> int:
        """
        generates an index for the course directory. existing entries will be deleted.
        scans the courses in a directory and generates an index.
        @param course_dir directory with courses. if omitted, course directory of index.
        @return number of courses added.
        """
        if course_dir is None:
            course_dir = self._course_dir
        self.clear()
        count = 0
        for name in os.listdir(course_dir):
            path = os.path.join(course_dir, name)
            if os.path.isdir(path):
                if self.from_course(path):
                    count += 1
        return count

    def from_course(self, course_path: str) -> bool:
        """
        scans a course and, if possible, generates an index entry for it.
        @param: course_path path of course in file sytem.
        @return whether the course was added to the index.
        """
        manifest_path = os.path.join(course_path, 'imsmanifest.xml')
        if not os.path.isfile(manifest_path):
            log(f'ignoring course {course_path} without manifest file')
            return False
        tree = ElementTree.parse(manifest_path)
        root = tree.getroot()
        elem = root.find('{http://www.imsglobal.org/xsd/imscp_v1p1}resources/{http://www.imsglobal.org/xsd/imscp_v1p1}resource')
        if elem is None:
            log(f'ignoring course {course_path} without resource element')
            return False
        href = elem.get('href')
        if href is None:
            log(f'ignoring course {course_path} without reference to index file')
            return False
        course_path = os.path.normpath(course_path)
        parsed_href = urllib.parse.urlparse(href)
        if parsed_href.scheme != '' or parsed_href.netloc != '':
            log(f'ignoring course {course_path} without relative path reference')
            return False
        index_abs_path = os.path.normpath(os.path.join(course_path, parsed_href.path))
        if not index_abs_path.startswith(course_path) or not os.path.isfile(index_abs_path):
            log(f'ignoring course {course_path} whose index file is not within the course directory')
            return False
        name = os.path.basename(course_path)
        index_url = urllib.parse.urlunparse((
            '', '', f'{name}/{parsed_href.path}',
            parsed_href.params, parsed_href.query, parsed_href.fragment))
        self.add_course({'name': name, 'path': index_url})
        return True


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

    index = CourseIndex(course_dir)
    count = index.from_course_dir()
    index.write()
    print(f'indexed {count} courses in {course_dir}')
